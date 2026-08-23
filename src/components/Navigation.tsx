import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarCheck,
  CreditCard,
  Receipt,
  MessageSquare,
  Briefcase,
  TrendingDown,
  GraduationCap,
  FileSpreadsheet,
  Code2,
  Printer,
  Sparkles,
} from 'lucide-react';
import { SchoolInfo } from '../types';

export type ActiveTab =
  | 'dashboard'
  | 'students'
  | 'profile'
  | 'attendance'
  | 'fees'
  | 'receipt'
  | 'due_alerts'
  | 'payroll'
  | 'expenses'
  | 'results';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  schoolInfo: SchoolInfo;
  onExportExcel: () => void;
  onOpenPythonScript: () => void;
  onOpenGoogleSheetsSync: () => void;
  isGoogleSheetsConnected: boolean;
  onPrint: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  schoolInfo,
  onExportExcel,
  onOpenPythonScript,
  onOpenGoogleSheetsSync,
  isGoogleSheetsConnected,
  onPrint,
}) => {
  const tabs: { id: ActiveTab; label: string; labelBn: string; icon: React.ReactNode; sheetNum: number }[] = [
    { id: 'dashboard', label: 'Dashboard & KPIs', labelBn: '১. ড্যাশবোর্ড', icon: <LayoutDashboard className="w-4 h-4" />, sheetNum: 1 },
    { id: 'students', label: 'Student Database', labelBn: '২. শিক্ষার্থী তথ্য', icon: <Users className="w-4 h-4" />, sheetNum: 2 },
    { id: 'profile', label: 'Student Profile', labelBn: '৩. ডিজিটাল প্রোফাইল', icon: <UserCheck className="w-4 h-4" />, sheetNum: 3 },
    { id: 'attendance', label: 'Attendance Tracker', labelBn: '৪. উপস্থিতি খাতা', icon: <CalendarCheck className="w-4 h-4" />, sheetNum: 4 },
    { id: 'fees', label: 'Fee Management', labelBn: '৫. ফি ব্যবস্থাপনা', icon: <CreditCard className="w-4 h-4" />, sheetNum: 5 },
    { id: 'receipt', label: 'Fee Receipt / Invoice', labelBn: '৬. ফি রসিদ (ভাউচার)', icon: <Receipt className="w-4 h-4" />, sheetNum: 6 },
    { id: 'due_alerts', label: 'WhatsApp Due Alert', labelBn: '৭. বকেয়া ও হোয়াটসঅ্যাপ', icon: <MessageSquare className="w-4 h-4" />, sheetNum: 7 },
    { id: 'payroll', label: 'Staff & Payroll', labelBn: '৮. শিক্ষক ও বেতন', icon: <Briefcase className="w-4 h-4" />, sheetNum: 8 },
    { id: 'expenses', label: 'Expense Tracker', labelBn: '৯. স্কুলের খরচ', icon: <TrendingDown className="w-4 h-4" />, sheetNum: 9 },
    { id: 'results', label: 'Academic Results', labelBn: '১০. রেজাল্ট ও প্রোগ্রেস', icon: <GraduationCap className="w-4 h-4" />, sheetNum: 10 },
  ];

  return (
    <header className="bg-slate-900 text-white shadow-xl sticky top-0 z-40 print:hidden border-b border-slate-800">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20 border border-amber-300">
            ☀️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">{schoolInfo.name}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> All-in-One 10 Tabs
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              {schoolInfo.nameBn} • <span className="text-slate-400">{schoolInfo.phone}</span>
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={onOpenGoogleSheetsSync}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-95 cursor-pointer border ${
              isGoogleSheetsConnected
                ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/50 shadow-emerald-950/40'
                : 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-600 shadow-emerald-900/30'
            }`}
            title="Configure Real-Time Google Sheets Webhook Sync"
          >
            <span className="relative flex h-2 w-2">
              {isGoogleSheetsConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isGoogleSheetsConnected ? 'bg-emerald-400' : 'bg-slate-300'
                }`}
              ></span>
            </span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>{isGoogleSheetsConnected ? 'Google Sheets (Live)' : 'Connect Google Sheets'}</span>
          </button>

          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 shadow-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            title="Download full 10-sheet automated Excel workbook with live formulas"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Excel (.xlsx)</span>
          </button>

          <button
            onClick={onOpenPythonScript}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-700/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            title="View, copy or download the complete Python openpyxl automation script"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Python Script</span>
          </button>

          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            title="Print Current Active Sheet"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700">
          <nav className="flex space-x-1 py-1.5 min-w-max">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{tab.icon}</span>
                  <div className="flex flex-col text-left leading-tight">
                    <span>{tab.label}</span>
                    <span className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                      {tab.labelBn}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
