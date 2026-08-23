import React, { useState } from 'react';
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
  Menu,
  X,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { SchoolInfo, User } from '../types';

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
  currentUser?: User | null;
  onOpenProfileModal?: () => void;
  onLogout?: () => void;
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
  currentUser,
  onOpenProfileModal,
  onLogout,
  onExportExcel,
  onOpenPythonScript,
  onOpenGoogleSheetsSync,
  isGoogleSheetsConnected,
  onPrint,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleTabSelect = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const getRoleTag = (role?: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Admin', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: '👑' };
      case 'teacher':
        return { label: 'Teacher', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40', icon: '👨‍🏫' };
      case 'accountant':
        return { label: 'Accounts', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: '💼' };
      case 'parent':
        return { label: 'Parent', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40', icon: '👨‍👩‍👧' };
      default:
        return { label: 'Staff', color: 'bg-slate-700 text-slate-300 border-slate-600', icon: '👤' };
    }
  };

  const roleInfo = getRoleTag(currentUser?.role);

  return (
    <>
      <header className="bg-slate-900 text-white shadow-xl sticky top-0 z-40 print:hidden border-b border-slate-800">
        {/* Top Header Row */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          {/* Logo & School Name */}
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shadow-amber-500/20 border border-amber-300 shrink-0">
              ☀️
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white truncate">
                  {schoolInfo.name}
                </h1>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30 hidden sm:flex items-center gap-0.5 shrink-0">
                  <Sparkles className="w-2.5 h-2.5" /> 10 Tabs
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium truncate">
                {schoolInfo.nameBn} • <span className="text-slate-400">{schoolInfo.phone}</span>
              </p>
            </div>
          </div>

          {/* Desktop & Tablet Action Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={onOpenGoogleSheetsSync}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer border ${
                isGoogleSheetsConnected
                  ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                  : 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-600'
              }`}
              title="Google Sheets Live Webhook Sync"
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
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
              <span>{isGoogleSheetsConnected ? 'Google Sheets' : 'Connect Sheets'}</span>
            </button>

            <button
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              title="Download Excel Workbook"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Excel (.xlsx)</span>
            </button>

            <button
              onClick={onOpenPythonScript}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              title="Python Script"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Python</span>
            </button>

            <button
              onClick={onPrint}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 cursor-pointer"
              title="Print Sheet"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            {/* User Profile Badge & Security */}
            {currentUser && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
                <button
                  onClick={onOpenProfileModal}
                  className="flex items-center gap-2 py-1 px-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-left transition-all cursor-pointer group shadow-sm"
                  title="অ্যাকাউন্ট ও নিরাপত্তা সেটিংস"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="min-w-0 hidden md:block">
                    <div className="text-xs font-bold text-slate-100 group-hover:text-white truncate max-w-[110px]">
                      {currentUser.name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[110px]">
                      {currentUser.roleTitle.split(' ')[0]}
                    </div>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold border ${roleInfo.color}`}>
                    {roleInfo.icon} {roleInfo.label}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Right Controls: Sync Quick Button + User Profile + Mobile Menu Toggle */}
          <div className="flex sm:hidden items-center gap-1.5">
            {currentUser && (
              <button
                onClick={onOpenProfileModal}
                className="p-1.5 rounded-lg bg-slate-800 text-amber-300 border border-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="User Profile"
              >
                <span>{roleInfo.icon}</span>
                <span className="text-[10px] font-semibold">{currentUser.name.split(' ')[0]}</span>
              </button>
            )}

            <button
              onClick={onOpenGoogleSheetsSync}
              className={`p-2 rounded-lg text-xs font-semibold border ${
                isGoogleSheetsConnected
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : 'bg-emerald-700 text-white border-emerald-600'
              }`}
              title="Google Sheets"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white border border-slate-700 active:bg-slate-700 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Scrollable Tabs Bar for Tablets & Desktops */}
        <div className="bg-slate-950/90 border-t border-slate-800/80 backdrop-blur">
          <div className="max-w-7xl mx-auto px-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700">
            <nav className="flex space-x-1 py-1.5 min-w-max">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabSelect(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
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

      {/* Mobile Slide-Over Drawer for Small Screens */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden bg-slate-950/80 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-slate-900 border-t border-slate-700 rounded-t-2xl max-h-[85vh] flex flex-col p-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <h3 className="font-bold text-white text-sm">সকল শিট ও মডিউল (All Modules)</h3>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modules List */}
            <div className="overflow-y-auto py-3 space-y-1.5 flex-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabSelect(tab.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-md'
                        : 'bg-slate-800/60 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-700 text-white' : 'bg-slate-900 text-blue-400'}`}>
                        {tab.icon}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{tab.label}</div>
                        <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>{tab.labelBn}</div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  </button>
                );
              })}
            </div>

            {/* Quick Actions at Bottom of Drawer */}
            <div className="pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenGoogleSheetsSync();
                }}
                className="p-2.5 rounded-xl bg-emerald-600 text-white font-bold flex flex-col items-center gap-1 text-center"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Google Sync</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onExportExcel();
                }}
                className="p-2.5 rounded-xl bg-slate-800 text-slate-200 font-semibold flex flex-col items-center gap-1 text-center border border-slate-700"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Excel (.xlsx)</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenPythonScript();
                }}
                className="p-2.5 rounded-xl bg-indigo-600 text-white font-semibold flex flex-col items-center gap-1 text-center"
              >
                <Code2 className="w-4 h-4" />
                <span>Python Script</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-slate-900/95 border-t border-slate-800 backdrop-blur px-2 py-1 flex items-center justify-around shadow-2xl print:hidden">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium min-w-[56px] ${
            activeTab === 'dashboard' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>ড্যাশবোর্ড</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium min-w-[56px] ${
            activeTab === 'students' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>শিক্ষার্থী</span>
        </button>

        <button
          onClick={() => setActiveTab('fees')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium min-w-[56px] ${
            activeTab === 'fees' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <CreditCard className="w-5 h-5 mb-0.5" />
          <span>ফি খাতা</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium min-w-[56px] ${
            activeTab === 'expenses' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <TrendingDown className="w-5 h-5 mb-0.5" />
          <span>খরচ</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium text-amber-400 min-w-[56px]"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>সকল মেনু</span>
        </button>
      </div>
    </>
  );
};

