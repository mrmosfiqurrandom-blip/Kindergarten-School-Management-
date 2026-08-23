import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Check,
  Copy,
  Download,
  X,
  ExternalLink,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Globe,
  Database,
  Link2,
} from 'lucide-react';
import {
  getStoredWebhookUrl,
  setStoredWebhookUrl,
  getStoredAutoSync,
  setStoredAutoSync,
  getStoredLastSync,
  getStoredSyncLogs,
  addSyncLog,
  sendToGoogleSheets,
  generateGoogleAppsScriptCode,
  SyncLog,
  SyncPayload,
} from '../utils/googleSheetsSync';
import {
  Student,
  FeeRecord,
  Staff,
  Expense,
  AcademicResult,
  AttendanceRecord,
  SchoolInfo,
} from '../types';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolInfo: SchoolInfo;
  students: Student[];
  fees: FeeRecord[];
  staffList: Staff[];
  expenses: Expense[];
  attendance: AttendanceRecord[];
  results: AcademicResult[];
  onSyncComplete?: () => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  schoolInfo,
  students,
  fees,
  staffList,
  expenses,
  attendance,
  results,
  onSyncComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'code' | 'guide' | 'logs'>('sync');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [autoSync, setAutoSync] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });
  const [copied, setCopied] = useState(false);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);

  useEffect(() => {
    if (isOpen) {
      setWebhookUrl(getStoredWebhookUrl());
      setAutoSync(getStoredAutoSync());
      setLastSyncTime(getStoredLastSync());
      setSyncLogs(getStoredSyncLogs());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const scriptCode = generateGoogleAppsScriptCode(schoolInfo.name);

  const handleSaveUrl = () => {
    setStoredWebhookUrl(webhookUrl);
    setSyncStatus({
      type: 'success',
      message: 'Webhook URL সংরক্ষিত হয়েছে!',
    });
    setTimeout(() => setSyncStatus({ type: 'idle', message: '' }), 3000);
  };

  const handleToggleAutoSync = (val: boolean) => {
    setAutoSync(val);
    setStoredAutoSync(val);
  };

  const handleTestConnection = async () => {
    if (!webhookUrl.trim()) {
      setSyncStatus({
        type: 'error',
        message: 'দয়া করে আগে আপনার Google Apps Script Web App URL টি দিন।',
      });
      return;
    }
    setStoredWebhookUrl(webhookUrl);
    setIsTesting(true);
    setSyncStatus({ type: 'idle', message: '' });

    try {
      const res = await sendToGoogleSheets(webhookUrl, {
        action: 'ping',
        timestamp: new Date().toISOString(),
        schoolName: schoolInfo.name,
      });

      addSyncLog({
        type: 'Connection Test (Ping)',
        status: 'success',
        message: 'Google Sheets connection verified successfully.',
      });
      setSyncLogs(getStoredSyncLogs());

      setSyncStatus({
        type: 'success',
        message: '🎉 চমৎকার! গুগল শিটের সাথে সফলভাবে কানেকশন তৈরি হয়েছে।',
      });
    } catch (err: any) {
      addSyncLog({
        type: 'Connection Test (Ping)',
        status: 'error',
        message: err.message || 'Connection test failed',
      });
      setSyncLogs(getStoredSyncLogs());
      setSyncStatus({
        type: 'error',
        message: err.message || 'কানেকশন টেস্ট ব্যর্থ হয়েছে। Webhook URL এবং Apps Script ডিপ্লয়মেন্ট চেক করুন।',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncData = async (target: 'all' | 'students' | 'fees' | 'staff' | 'expenses' | 'results' | 'attendance') => {
    const url = webhookUrl.trim() || getStoredWebhookUrl();
    if (!url) {
      setSyncStatus({
        type: 'error',
        message: 'দয়া করে আগে আপনার Google Apps Script Web App URL প্রদান করুন।',
      });
      return;
    }

    setIsSyncing(true);
    setSyncStatus({ type: 'idle', message: '' });

    const payload: SyncPayload = {
      action: target === 'all' ? 'sync_all' : (`sync_${target}` as any),
      timestamp: new Date().toISOString(),
      schoolName: schoolInfo.name,
    };

    if (target === 'all' || target === 'students') payload.students = students;
    if (target === 'all' || target === 'fees') payload.fees = fees;
    if (target === 'all' || target === 'staff') payload.staff = staffList;
    if (target === 'all' || target === 'expenses') payload.expenses = expenses;
    if (target === 'all' || target === 'results') payload.results = results;
    if (target === 'all' || target === 'attendance') payload.attendance = attendance;

    const totalRecords =
      (payload.students?.length || 0) +
      (payload.fees?.length || 0) +
      (payload.staff?.length || 0) +
      (payload.expenses?.length || 0) +
      (payload.results?.length || 0) +
      (payload.attendance?.length || 0);

    try {
      const res = await sendToGoogleSheets(url, payload);

      addSyncLog({
        type: target === 'all' ? 'Full Sync (All 6 Sheets)' : `Sync (${target})`,
        status: 'success',
        message: res.message,
        recordsCount: totalRecords,
      });

      setLastSyncTime(new Date().toISOString());
      setSyncLogs(getStoredSyncLogs());
      setSyncStatus({
        type: 'success',
        message: `✅ সফলভাবে ${totalRecords}টি রেকর্ড গুগল শিটে সিঙ্ক সম্পন্ন হয়েছে!`,
      });

      if (onSyncComplete) onSyncComplete();
    } catch (err: any) {
      addSyncLog({
        type: target === 'all' ? 'Full Sync' : `Sync (${target})`,
        status: 'error',
        message: err.message || 'Sync failed',
      });
      setSyncLogs(getStoredSyncLogs());
      setSyncStatus({
        type: 'error',
        message: err.message || 'সিঙ্ক করতে সমস্যা হয়েছে। Webhook URL চেক করুন।',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadScript = () => {
    const blob = new Blob([scriptCode], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Kindergarten_GoogleAppsScript_Code.gs';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 text-slate-100 rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl border border-slate-700 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Google Sheets Live Sync Hub
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Google Apps Script Webhook
                </span>
              </div>
              <p className="text-xs text-slate-400">
                অ্যাপের সকল ডেটা সরাসরি আপনার গুগল স্প্রেডশিটে রিয়েল-টাইম সিঙ্ক ও ব্যাকআপ করুন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 mt-3 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('sync')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'sync'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>লাইভ সিঙ্ক (Live Sync)</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'code'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Apps Script কোড (Code.gs)</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'guide'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>ধাপে ধাপে গাইড (Setup Guide)</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'logs'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>সিঙ্ক হিস্ট্রি ({syncLogs.length})</span>
          </button>
        </div>

        {/* Tab 1: Live Sync & Webhook URL Input */}
        {activeTab === 'sync' && (
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {/* Status Alert Banner */}
            {syncStatus.message && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 border ${
                  syncStatus.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                }`}
              >
                {syncStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{syncStatus.message}</span>
              </div>
            )}

            {/* Webhook URL Input Card */}
            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-emerald-400" />
                  <span>Google Apps Script Web App URL (Webhook)</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {webhookUrl ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      URL সেট করা আছে
                    </span>
                  ) : (
                    <span className="text-amber-400">URL প্রয়োজন</span>
                  )}
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleSaveUrl}
                  className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  Save URL
                </button>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-900/40 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'টেস্টিং...' : 'Test Connection'}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                💡 <span className="font-semibold text-slate-300">কোথা থেকে পাবেন?</span> গুগল শিটের Apps Script এ গিয়ে <b>Deploy &gt; New deployment &gt; Web app</b> করে পাওয়া URL টি এখানে দিন। (বিস্তারিত দেখতে <button onClick={() => setActiveTab('guide')} className="text-emerald-400 underline hover:text-emerald-300 cursor-pointer">ধাপে ধাপে গাইড</button> দেখুন)
              </p>
            </div>

            {/* Auto-Sync & Manual Trigger Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Auto Sync Toggle */}
              <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>অটোমেটিক রিয়েল-টাইম সিঙ্ক</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    নতুন শিক্ষার্থী, ফি বা খরচ এন্ট্রি করলেই সাথে সাথে ব্যাকগ্রাউন্ডে গুগল শিটে পুশ হবে।
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-3">
                  <input
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => handleToggleAutoSync(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Last Sync Info */}
              <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>সর্বশেষ সিঙ্কের সময়</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    {lastSyncTime ? new Date(lastSyncTime).toLocaleString('en-GB') : 'এখনও কোনো সিঙ্ক করা হয়নি'}
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold">
                  {students.length + fees.length + staffList.length + expenses.length + results.length} Records
                </span>
              </div>
            </div>

            {/* One-Click Master Sync */}
            <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-blue-950/60 rounded-xl p-4 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>⚡ ১-ক্লিক সম্পূর্ণ ডেটা সিঙ্ক (Full 6 Sheets Sync)</span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  শিক্ষার্থী, ফি খাতা, বেতন, খরচ, পরীক্ষার মার্কশিট ও উপস্থিতি এক ক্লিকে গুগল শিটে পাঠিয়ে দিন
                </p>
              </div>

              <button
                onClick={() => handleSyncData('all')}
                disabled={isSyncing}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-700/40 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'গুগল শিটে সিঙ্ক হচ্ছে...' : 'Sync All to Google Sheets Now'}</span>
              </button>
            </div>

            {/* Selective Module Sync Grid */}
            <div>
              <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                <span>মডিউল অনুযায়ী আলাদা সিঙ্ক (Selective Module Sync):</span>
                <span className="text-[11px] text-slate-400">প্রয়োজনমতো নির্দিষ্ট শিট আপডেট করুন</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <button
                  onClick={() => handleSyncData('students')}
                  disabled={isSyncing}
                  className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-slate-400 group-hover:text-blue-400">
                    <span className="font-bold text-white">👨‍🎓 Students ({students.length})</span>
                    <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform" />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">1_Students শিট আপডেট করুন</div>
                </button>

                <button
                  onClick={() => handleSyncData('fees')}
                  disabled={isSyncing}
                  className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-slate-400 group-hover:text-emerald-400">
                    <span className="font-bold text-white">💳 Fees ({fees.length})</span>
                    <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform" />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">2_Fee_Ledger শিট আপডেট করুন</div>
                </button>

                <button
                  onClick={() => handleSyncData('staff')}
                  disabled={isSyncing}
                  className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-slate-400 group-hover:text-purple-400">
                    <span className="font-bold text-white">💼 Staff ({staffList.length})</span>
                    <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform" />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">3_Staff_Payroll শিট আপডেট করুন</div>
                </button>

                <button
                  onClick={() => handleSyncData('expenses')}
                  disabled={isSyncing}
                  className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/50 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-slate-400 group-hover:text-rose-400">
                    <span className="font-bold text-white">📉 Expenses ({expenses.length})</span>
                    <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform" />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">4_Expenses শিট আপডেট করুন</div>
                </button>

                <button
                  onClick={() => handleSyncData('results')}
                  disabled={isSyncing}
                  className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-slate-400 group-hover:text-sky-400">
                    <span className="font-bold text-white">🏆 Results ({results.length})</span>
                    <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform" />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">5_Academic_Results আপডেট করুন</div>
                </button>

                <button
                  onClick={() => handleSyncData('attendance')}
                  disabled={isSyncing}
                  className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-slate-400 group-hover:text-amber-400">
                    <span className="font-bold text-white">📅 Attendance ({attendance.length})</span>
                    <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform" />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">6_Attendance শিট আপডেট করুন</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Code Viewer */}
        {activeTab === 'code' && (
          <div className="flex-1 overflow-hidden flex flex-col py-3 space-y-3">
            <div className="flex items-center justify-between text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="font-bold text-indigo-300">Code.gs</span> — সম্পূর্ণ গুগল অ্যাপস স্ক্রিপ্ট কোড। এটি আপনার শিটে অটো-ট্যাব ও হেডার তৈরি করবে।
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Code!' : 'Copy Code'}</span>
                </button>
                <button
                  onClick={handleDownloadScript}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .gs</span>
                </button>
              </div>
            </div>

            <pre className="flex-1 overflow-y-auto p-4 text-xs font-mono text-emerald-300/90 leading-relaxed bg-slate-950 rounded-xl border border-slate-800 select-all scrollbar-thin scrollbar-thumb-slate-800">
              <code>{scriptCode}</code>
            </pre>
          </div>
        )}

        {/* Tab 3: Step by step visual setup guide in Bengali */}
        {activeTab === 'guide' && (
          <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
            <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-500/30">
              <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>৫ মিনিটে গুগল শিট কানেক্ট করার সহজ উপায় (No Coding Required)</span>
              </h4>
              <p className="text-slate-300 text-xs mt-1">
                নিচের ৫টি সহজ ধাপ অনুসরণ করুন এবং আপনার গুগল শিটকে একটি রিয়েল-টাইম ডেটাবেজে রূপান্তর করুন:
              </p>
            </div>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  ১
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white text-sm">নতুন একটি গুগল শিট খুলুন</div>
                  <p className="text-slate-400 mt-1">
                    আপনার ব্রাউজারে <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-400 underline font-mono">sheets.new</a> ওপেন করুন অথবা Google Drive থেকে একটি নতুন Blank Spreadsheet তৈরি করে নাম দিন (যেমন: <b>Kindergarten School Database</b>)।
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  ২
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white text-sm">Apps Script এ যান</div>
                  <p className="text-slate-400 mt-1">
                    গুগল শিটের উপরের মেনুবার থেকে <b>Extensions &gt; Apps Script</b> এ ক্লিক করুন। একটি নতুন কোড এডিটর উইন্ডো ওপেন হবে।
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  ৩
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white text-sm">কোড পেস্ট করুন ও সেভ করুন</div>
                  <p className="text-slate-400 mt-1">
                    এই উইন্ডোর <b>"Apps Script কোড"</b> ট্যাব থেকে কোডটি কপি করুন। Apps Script এডিটর-এর আগের কোড মুছে এই কোডটি পেস্ট করে উপরে থাকা 💾 <b>Save</b> আইকনে ক্লিক করুন।
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  ৪
                </div>
                <div className="flex-1">
                  <div className="font-bold text-emerald-400 text-sm">Web App হিসেবে Deploy করুন (সবচেয়ে গুরুত্বপূর্ণ)</div>
                  <p className="text-slate-300 mt-1">
                    Apps Script এর উপরের ডানপাশের নীল <b>Deploy &gt; New deployment</b> এ ক্লিক করুন:
                  </p>
                  <ul className="list-disc list-inside text-slate-400 mt-1.5 space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <li>Select type: ⚙️ <b>Web app</b> নির্বাচন করুন।</li>
                    <li>Execute as: <b>Me (আপনার ইমেইল)</b> থাকবে।</li>
                    <li>Who has access: <b>Anyone</b> নির্বাচন করুন (এটি দিলে অ্যাপ সরাসরি ডেটা পাঠাতে পারে)।</li>
                    <li>এরপর <b>Deploy</b> বাটনে চাপ দিন এবং <b>Authorize Access</b> করে গুগল অ্যাকাউন্ট সিলেক্ট করে এলাউ করুন।</li>
                  </ul>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  ৫
                </div>
                <div className="flex-1">
                  <div className="font-bold text-indigo-400 text-sm">Webhook URL টি এখানে পেস্ট করে সিঙ্ক করুন!</div>
                  <p className="text-slate-400 mt-1">
                    ডিপ্লয় করার পর পাওয়া <b>Web app URL</b> টি কপি করে এই মোডালের <b>"লাইভ সিঙ্ক"</b> ট্যাবের বক্সে পেস্ট করে <b>"Test Connection"</b> বা <b>"Sync All"</b> বাটনে চাপ দিলেই আপনার গুগল শিটটি পূর্ণাঙ্গ ডেটাবেজে পরিণত হবে!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Logs */}
        {activeTab === 'logs' && (
          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300">সাম্প্রতিক সিঙ্ক রেকর্ড ও কার্যক্রম:</span>
              <span className="text-[11px] text-slate-500">সর্বশেষ ৩০টি কার্যকলাপ</span>
            </div>

            {syncLogs.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/50 rounded-xl border border-slate-800 text-slate-500">
                এখনও কোনো সিঙ্ক হিস্ট্রি নেই। "Test Connection" বা "Sync All" ক্লিক করুন।
              </div>
            ) : (
              <div className="space-y-2">
                {syncLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      {log.status === 'success' ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                          <AlertCircle className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{log.type}</span>
                          {log.recordsCount !== undefined && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                              {log.recordsCount} records
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{log.message}</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono shrink-0 whitespace-nowrap">
                      {log.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>নিরাপদ ও এনক্রিপ্টেড গুগল ক্লাউড সংযোগ</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
            >
              Close
            </button>
            {activeTab !== 'sync' && (
              <button
                onClick={() => setActiveTab('sync')}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Go to Live Sync</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
