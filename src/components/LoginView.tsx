import React, { useState } from 'react';
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Users,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Zap,
  ArrowRight,
  School,
} from 'lucide-react';
import { User, SchoolInfo } from '../types';
import { INITIAL_USERS, loginUser, setStoredCurrentUser } from '../utils/auth';

interface LoginViewProps {
  schoolInfo: SchoolInfo;
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  schoolInfo,
  onLoginSuccess,
}) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!usernameOrEmail.trim() || !password) {
      setErrorMessage('অনুগ্রহ করে ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = loginUser(usernameOrEmail, password);
      setIsLoading(false);

      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'লগইন ব্যর্থ হয়েছে।');
      }
    }, 300);
  };

  const handleQuickDemoLogin = (account: (typeof INITIAL_USERS)[0]) => {
    const { passwordHash: _, ...safeUser } = account;
    setStoredCurrentUser(safeUser);
    onLoginSuccess(safeUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl z-10 space-y-6">
        {/* School Branding Card */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black text-3xl shadow-xl shadow-amber-500/20 border-2 border-amber-300">
            ☀️
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {schoolInfo.name}
            </h1>
            <p className="text-sm sm:text-base text-amber-300 font-medium mt-0.5">
              {schoolInfo.nameBn}
            </p>
            <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-2">
              <span>📍 {schoolInfo.address}</span>
              <span>•</span>
              <span>📞 {schoolInfo.phone}</span>
            </p>
          </div>
        </div>

        {/* Main Grid: Left Login Form & Right 1-Click Role Logins */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Left Column: Form (7 cols) */}
          <div className="md:col-span-7 space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">স্কুল ম্যানেজমেন্ট লগইন</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                আপনার স্কুলের ডিজিটাল সিস্টেমে প্রবেশ করতে তথ্য দিন অথবা পাশের বাটনে ক্লিক করুন।
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleManualLogin} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  ব্যবহারকারীর নাম বা ইমেইল (Username / Email)
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="যেমন: admin, teacher, accountant বা parent"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    পাসওয়ার্ড (Password)
                  </label>
                  <span className="text-[11px] text-slate-400">ডিফল্ট: admin123 / teacher123</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="পাসওয়ার্ড লিখুন"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                  />
                  <span>সেশন মনে রাখুন (Auto-login)</span>
                </label>
                <span className="text-[11px] text-slate-400">নিরাপদ ব্রাউজিং</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>লগইন হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>সফটওয়্যারে প্রবেশ করুন (Sign In)</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Table */}
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-[11px] space-y-1.5">
              <div className="font-semibold text-slate-300 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>টেস্ট লগইন তথ্য (Demo Credentials):</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-400">
                <div>👑 <b>Admin:</b> <code className="text-amber-300">admin</code> / <code className="text-amber-300">admin123</code></div>
                <div>👨‍🏫 <b>Teacher:</b> <code className="text-blue-300">teacher</code> / <code className="text-blue-300">teacher123</code></div>
                <div>💼 <b>Accounts:</b> <code className="text-emerald-300">accountant</code> / <code className="text-emerald-300">account123</code></div>
                <div>👨‍👩‍👧 <b>Parent:</b> <code className="text-purple-300">parent</code> / <code className="text-purple-300">parent123</code></div>
              </div>
            </div>
          </div>

          {/* Right Column: 1-Click Role Portals (5 cols) */}
          <div className="md:col-span-5 bg-slate-950/50 rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>এক ক্লিকে ডেমো লগইন (1-Click Portals)</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                নিচের যেকোনো রোল নির্বাচন করে সরাসরি প্রবেশ করতে ক্লিক করুন:
              </p>

              {/* Preset Login Buttons */}
              <div className="space-y-2">
                {INITIAL_USERS.map((user) => {
                  let roleColor = 'border-amber-500/40 hover:bg-amber-500/10 text-amber-300';
                  let icon = '👑';
                  if (user.role === 'teacher') {
                    roleColor = 'border-blue-500/40 hover:bg-blue-500/10 text-blue-300';
                    icon = '👨‍🏫';
                  } else if (user.role === 'accountant') {
                    roleColor = 'border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-300';
                    icon = '💼';
                  } else if (user.role === 'parent') {
                    roleColor = 'border-purple-500/40 hover:bg-purple-500/10 text-purple-300';
                    icon = '👨‍👩‍👧';
                  }

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleQuickDemoLogin(user)}
                      className={`w-full text-left p-3 rounded-xl border bg-slate-900/90 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-between group shadow-sm ${roleColor}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-base shrink-0">
                          {icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate group-hover:text-white">
                            {user.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {user.roleTitle}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Features summary badge */}
            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>১০টি সমন্বিত শিট ও ডিজিটাল প্রোফাইল</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>গুগল শিট অটোমেটিক লাইভ সিঙ্ক</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>ব্রাউজার অটো-সেভ (ডেটা নষ্ট হবে না)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {schoolInfo.name} • সর্বস্বত্ব সংরক্ষিত</p>
        </div>
      </div>
    </div>
  );
};
