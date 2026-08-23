import React, { useState, useEffect } from 'react';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Settings,
  ExternalLink,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  getStoredWebhookUrl,
  getStoredAutoSync,
  getStoredLastSync,
  setStoredAutoSync,
  validateWebhookUrl,
} from '../utils/googleSheetsSync';

interface LiveSyncStatusBarProps {
  onOpenSyncModal: () => void;
  onManualSyncAll: () => Promise<void>;
  isSyncing: boolean;
  lastSyncTimestamp: string | null;
  activeSheetName?: string;
  onSyncCurrentSheet?: () => Promise<void>;
}

export const LiveSyncStatusBar: React.FC<LiveSyncStatusBarProps> = ({
  onOpenSyncModal,
  onManualSyncAll,
  isSyncing,
  lastSyncTimestamp,
  activeSheetName,
  onSyncCurrentSheet,
}) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isAutoSync, setIsAutoSync] = useState(false);
  const [timeAgo, setTimeAgo] = useState<string>('কখনো হয়নি (Never)');

  const validation = validateWebhookUrl(webhookUrl);
  const isConnected = validation.isValid;

  useEffect(() => {
    const url = getStoredWebhookUrl();
    setWebhookUrl(url);
    setIsAutoSync(getStoredAutoSync());
  }, [lastSyncTimestamp, isSyncing]);

  useEffect(() => {
    const updateTimeAgo = () => {
      const stored = lastSyncTimestamp || getStoredLastSync();
      if (!stored) {
        setTimeAgo('এখনো হয়নি');
        return;
      }
      try {
        const date = new Date(stored);
        const diffMs = Date.now() - date.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);

        if (diffSec < 15) {
          setTimeAgo('এইমাত্র (Just now)');
        } else if (diffSec < 60) {
          setTimeAgo(`${diffSec} সেকেন্ড আগে`);
        } else if (diffMin < 60) {
          setTimeAgo(`${diffMin} মিনিট আগে`);
        } else {
          setTimeAgo(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      } catch {
        setTimeAgo('সংরক্ষিত');
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 10000);
    return () => clearInterval(interval);
  }, [lastSyncTimestamp, isSyncing]);

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-200 px-3 sm:px-6 py-2 transition-all shadow-inner print:hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* Left: Connection Status Badge */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isConnected ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
              ></span>
            </span>

            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="text-slate-400 font-normal hidden sm:inline">গুগল শিট লাইভ সিঙ্ক:</span>
              {isConnected ? (
                <span className="text-emerald-300 flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  সংযুক্ত (Live Webhook Connected)
                </span>
              ) : (
                <button
                  onClick={onOpenSyncModal}
                  className="text-amber-300 hover:text-amber-200 underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  গুগল শিট কানেক্ট করুন (Setup Required)
                </button>
              )}
            </div>
          </div>

          {/* Auto-Sync Pill */}
          <div className="flex items-center gap-1.5 bg-slate-950/70 px-2 py-0.5 rounded-full border border-slate-800 text-[11px]">
            <span className="text-slate-400">অটো-সিঙ্ক:</span>
            <span className={isAutoSync ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
              {isAutoSync ? '⚡ চালু (ON)' : '⏸ বন্ধ (OFF)'}
            </span>
          </div>
        </div>

        {/* Right: Last Sync Time & Instant Action Triggers */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end flex-wrap sm:flex-nowrap text-xs">
          <div className="flex items-center gap-1 text-slate-400 text-[11px]">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>সর্বশেষ সিঙ্ক:</span>
            <span className="text-slate-200 font-medium font-mono">{timeAgo}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {onSyncCurrentSheet && activeSheetName && (
              <button
                onClick={onSyncCurrentSheet}
                disabled={isSyncing || !isConnected}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                title={`Sync only ${activeSheetName} to Google Sheets`}
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
                <span>সিঙ্ক: {activeSheetName}</span>
              </button>
            )}

            <button
              onClick={onManualSyncAll}
              disabled={isSyncing || !isConnected}
              className={`px-3 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all ${
                isConnected
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 hover:scale-[1.02] active:scale-95'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
              }`}
              title="Push all 6 modules immediately to Google Sheets"
            >
              <Zap className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce text-amber-300' : 'text-amber-300'}`} />
              <span>{isSyncing ? 'সিঙ্ক হচ্ছে...' : '⚡ ১-ক্লিকে সব সিঙ্ক (Sync All)'}</span>
            </button>

            <button
              onClick={onOpenSyncModal}
              className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
              title="Open Google Sheets Configuration & Code"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
