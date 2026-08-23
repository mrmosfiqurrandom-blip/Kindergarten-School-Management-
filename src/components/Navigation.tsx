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
  ShieldCheck,
  LogOut,
  Sliders,
  Database,
  ExternalLink,
  ChevronLeft,
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
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
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
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
}) => {
  const navSections = [
    {
      groupTitle: 'মূল ড্যাশবোর্ড (Overview)',
      items: [
        {
          id: 'dashboard' as ActiveTab,
          label: 'Dashboard & KPIs',
          labelBn: 'ড্যাশবোর্ড ওভারভিউ',
          icon: <LayoutDashboard className="w-4 h-4" />,
          badge: 'Live',
        },
      ],
    },
    {
      groupTitle: 'শিক্ষার্থী ও একাডেমিক (Academics)',
      items: [
        {
          id: 'students' as ActiveTab,
          label: 'Student Database',
          labelBn: 'শিক্ষার্থী তালিকা ও এন্ট্রি',
          icon: <Users className="w-4 h-4" />,
        },
        {
          id: 'profile' as ActiveTab,
          label: 'Student Profile',
          labelBn: 'ডিজিটাল আইডি ও প্রোফাইল',
          icon: <UserCheck className="w-4 h-4" />,
        },
        {
          id: 'attendance' as ActiveTab,
          label: 'Attendance Tracker',
          labelBn: 'উপস্থিতি খাতা',
          icon: <CalendarCheck className="w-4 h-4" />,
        },
        {
          id: 'results' as ActiveTab,
          label: 'Academic Results',
          labelBn: 'রেজাল্ট ও মার্কশিট',
          icon: <GraduationCap className="w-4 h-4" />,
        },
      ],
    },
    {
      groupTitle: 'হিসাব ও অর্থ (Finance & Accounts)',
      items: [
        {
          id: 'fees' as ActiveTab,
          label: 'Fee Management',
          labelBn: 'ফি আদায় ও বকেয়া হিসাব',
          icon: <CreditCard className="w-4 h-4" />,
        },
        {
          id: 'receipt' as ActiveTab,
          label: 'Fee Receipt / Voucher',
          labelBn: 'ফি রসিদ ও ভাউচার',
          icon: <Receipt className="w-4 h-4" />,
        },
        {
          id: 'payroll' as ActiveTab,
          label: 'Staff & Payroll',
          labelBn: 'শিক্ষক ও স্টাফ বেতন',
          icon: <Briefcase className="w-4 h-4" />,
        },
        {
          id: 'expenses' as ActiveTab,
          label: 'Expense Tracker',
          labelBn: 'স্কুলের দৈনিক খরচ',
          icon: <TrendingDown className="w-4 h-4" />,
        },
      ],
    },
    {
      groupTitle: 'যোগাযোগ ও মেসেজিং (Alerts)',
      items: [
        {
          id: 'due_alerts' as ActiveTab,
          label: 'WhatsApp Due Alert',
          labelBn: 'বকেয়া নোটিশ ও হোয়াটসঅ্যাপ',
          icon: <MessageSquare className="w-4 h-4" />,
        },
      ],
    },
  ];

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

  const handleSelectTab = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    setIsMobileSidebarOpen(false);
  };

  // Find active tab info for header display
  const allTabs = navSections.flatMap((s) => s.items);
  const currentTabInfo = allTabs.find((t) => t.id === activeTab) || allTabs[0];

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP & TABLET LEFT SIDEBAR MENUBAR                                  */}
      {/* ========================================================================= */}
      <aside
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 bg-slate-900 border-r border-slate-800 text-slate-200 transition-all duration-300 ${
          isSidebarCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Sidebar Header: School Logo & Title */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-md shadow-amber-500/20 border border-amber-300 shrink-0">
              ☀️
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-white tracking-tight truncate">
                  {schoolInfo.name}
                </h1>
                <p className="text-[10px] text-amber-300 font-medium truncate">
                  {schoolInfo.nameBn}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Current User Role Card in Sidebar */}
        {currentUser && !isSidebarCollapsed && (
          <div className="p-3 mx-3 mt-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-between gap-2 shadow-inner">
            <button
              onClick={onOpenProfileModal}
              className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer group flex-1"
              title="প্রোফাইল সেটিংস ও রোল পরিবর্তন"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-xs font-bold text-white shadow">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-100 group-hover:text-white truncate">
                  {currentUser.name}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${roleInfo.color}`}>
                    {roleInfo.icon} {roleInfo.label}
                  </span>
                </div>
              </div>
            </button>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition-colors cursor-pointer"
              title="লগআউট"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {section.groupTitle}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
                      title={item.label}
                    >
                      <span className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`}>
                        {item.icon}
                      </span>
                      {!isSidebarCollapsed && (
                        <div className="flex-1 text-left min-w-0">
                          <div className="truncate">{item.label}</div>
                          <div className={`text-[10px] truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                            {item.labelBn}
                          </div>
                        </div>
                      )}
                      {!isSidebarCollapsed && item.badge && (
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quick Integration Tools Section */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1">
            {!isSidebarCollapsed && (
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ইন্টিগ্রেশন ও এক্সপোর্ট (Tools)
              </div>
            )}

            <button
              onClick={onOpenGoogleSheetsSync}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isGoogleSheetsConnected
                  ? 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
              title="Google Sheets Live Webhook Sync"
            >
              <div className="relative shrink-0">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                {isGoogleSheetsConnected && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                )}
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 text-left min-w-0">
                  <div className="truncate font-semibold">গুগল শিট সিঙ্ক</div>
                  <div className="text-[10px] text-emerald-400 truncate">
                    {isGoogleSheetsConnected ? '✓ লাইভ কানেক্টেড' : 'কানেক্ট করুন'}
                  </div>
                </div>
              )}
            </button>

            <button
              onClick={onExportExcel}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/70 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-all cursor-pointer ${
                isSidebarCollapsed ? 'justify-center px-2' : ''
              }`}
              title="Download 10-Sheet Kindergarten Excel Workbook"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-400 shrink-0" />
              {!isSidebarCollapsed && (
                <div className="flex-1 text-left min-w-0">
                  <div className="truncate">এক্সেল ফাইল (.xlsx)</div>
                  <div className="text-[10px] text-slate-400 truncate">১০-শিট অটো-ওয়ার্কবুক</div>
                </div>
              )}
            </button>

            <button
              onClick={onOpenPythonScript}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/70 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-all cursor-pointer ${
                isSidebarCollapsed ? 'justify-center px-2' : ''
              }`}
              title="Python (openpyxl) Script"
            >
              <Code2 className="w-4 h-4 text-indigo-400 shrink-0" />
              {!isSidebarCollapsed && (
                <div className="flex-1 text-left min-w-0">
                  <div className="truncate">পাইথন স্ক্রিপ্ট</div>
                  <div className="text-[10px] text-slate-400 truncate">openpyxl অটোমেশন</div>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        {!isSidebarCollapsed && (
          <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/70 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>সেন্ট্রাল ডাটাবেজ সচল</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">v2.5</span>
          </div>
        )}
      </aside>

      {/* ========================================================================= */}
      {/* 2. TOP HEADER BAR (Stays fixed above main workspace)                     */}
      {/* ========================================================================= */}
      <header
        className={`bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-30 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          {/* Left: Mobile hamburger & Active Section Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
              aria-label="Toggle Menubar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-blue-400">{currentTabInfo.icon}</span>
                <h2 className="text-sm sm:text-base font-bold text-white truncate">
                  {currentTabInfo.label}
                </h2>
                <span className="text-xs text-slate-400 hidden md:inline">
                  • {currentTabInfo.labelBn}
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Google Sheets Sync Button */}
            <button
              onClick={onOpenGoogleSheetsSync}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer border ${
                isGoogleSheetsConnected
                  ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                  : 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-600'
              }`}
              title="Google Sheets Live Sync"
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
              <span className="hidden sm:inline">{isGoogleSheetsConnected ? 'গুগল শিট সিঙ্ক' : 'Connect Sheets'}</span>
            </button>

            {/* Direct Excel Download */}
            <button
              onClick={onExportExcel}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              title="Download Excel Workbook"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Excel (.xlsx)</span>
            </button>

            {/* Print Button */}
            <button
              onClick={onPrint}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 cursor-pointer flex items-center gap-1"
              title="Print Current View"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden md:inline">প্রিন্ট</span>
            </button>

            {/* User Profile Button */}
            {currentUser && (
              <button
                onClick={onOpenProfileModal}
                className="flex items-center gap-2 py-1 px-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-left transition-all cursor-pointer shadow-sm"
                title="অ্যাকাউন্ট ও সিকিউরিটি সেটিংস"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${roleInfo.color}`}>
                    {roleInfo.icon} {roleInfo.label}
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. MOBILE SIDEBAR DRAWER (Slide-over for phones & tablets)               */}
      {/* ========================================================================= */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-slate-950/80 backdrop-blur-xs flex">
          <div className="bg-slate-900 w-80 max-w-[85vw] h-full flex flex-col shadow-2xl border-r border-slate-800 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black text-lg">
                  ☀️
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-sm truncate">{schoolInfo.name}</h3>
                  <p className="text-[10px] text-amber-300 truncate">{schoolInfo.nameBn}</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile User Profile */}
            {currentUser && (
              <div className="p-3 mx-3 mt-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200 truncate">{currentUser.name}</div>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${roleInfo.color}`}>
                      {roleInfo.icon} {roleInfo.label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    if (onOpenProfileModal) onOpenProfileModal();
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[10px] font-semibold cursor-pointer"
                >
                  প্রোফাইল
                </button>
              </div>
            )}

            {/* Mobile Navigation List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {navSections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-1">
                  <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {section.groupTitle}
                  </div>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                            isActive
                              ? 'bg-blue-600 text-white font-bold shadow-md'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="truncate">{item.label}</div>
                            <div className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                              {item.labelBn}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Mobile Tools */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <button
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    onOpenGoogleSheetsSync();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 text-left"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-bold">গুগল শিট লাইভ সিঙ্ক</div>
                    <div className="text-[10px] text-emerald-400">
                      {isGoogleSheetsConnected ? '✓ কানেক্টেড' : 'কানেক্ট করুন'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    onExportExcel();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700 text-left"
                >
                  <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="font-bold">এক্সেল ডাউনলোড (.xlsx)</div>
                    <div className="text-[10px] text-slate-400">১০-শিট ফুল ফাইল</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Drawer Logout */}
            <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <button
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  if (onLogout) onLogout();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-950/60 text-red-300 border border-red-900/60 text-xs font-semibold hover:bg-red-900/60 w-full justify-center"
              >
                <LogOut className="w-4 h-4" />
                <span>লগআউট করুন</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileSidebarOpen(false)}></div>
        </div>
      )}
    </>
  );
};
