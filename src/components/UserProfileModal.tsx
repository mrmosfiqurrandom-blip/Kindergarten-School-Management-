import React, { useState } from 'react';
import {
  User,
  Shield,
  KeyRound,
  LogOut,
  X,
  Check,
  AlertCircle,
  Sparkles,
  Users,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { User as UserType } from '../types';
import { INITIAL_USERS, updateUserPassword, setStoredCurrentUser } from '../utils/auth';

interface UserProfileModalProps {
  currentUser: UserType;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onSwitchUser: (newUser: UserType) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onLogout,
  onSwitchUser,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'switch'>('profile');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'নতুন পাসওয়ার্ড এবং কনফার্মেশন মিলছে না।' });
      return;
    }

    const res = updateUserPassword(currentUser.id, oldPassword, newPassword);
    if (res.success) {
      setStatusMessage({ type: 'success', text: '✅ পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।' });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 text-xs">👑 Super Admin</span>;
      case 'teacher':
        return <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40 text-xs">👨‍🏫 Teacher</span>;
      case 'accountant':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 text-xs">💼 Accountant</span>;
      case 'parent':
        return <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40 text-xs">👨‍👩‍👧 Parent</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-slate-700 text-slate-300 font-bold text-xs">{role}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">ব্যবহারকারী অ্যাকাউন্ট ও নিরাপত্তা</h3>
              <p className="text-xs text-slate-400">অ্যাকাউন্ট সেটিংস, পাসওয়ার্ড ও ভূমিকা নিয়ন্ত্রণ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('profile'); setStatusMessage(null); }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>প্রোফাইল তথ্য</span>
          </button>
          <button
            onClick={() => { setActiveTab('password'); setStatusMessage(null); }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'password'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>পাসওয়ার্ড পরিবর্তন</span>
          </button>
          <button
            onClick={() => { setActiveTab('switch'); setStatusMessage(null); }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'switch'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>রোল সুইচ</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* TAB 1: Profile Info */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-xl font-black text-white shadow-lg shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">{currentUser.name}</span>
                    {getRoleBadge(currentUser.role)}
                  </div>
                  <p className="text-slate-400 text-xs">{currentUser.roleTitle}</p>
                  <p className="text-slate-500 text-[11px]">ইমেইল: {currentUser.email} • ইউজারনেম: @{currentUser.username}</p>
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>অ্যাক্সেস পারমিশন (Assigned Permissions):</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentUser.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Change Password */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-300">বর্তমান পাসওয়ার্ড (Current Password)</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="বর্তমান পাসওয়ার্ড দিন"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-300">নতুন পাসওয়ার্ড (New Password)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-300">নতুন পাসওয়ার্ড নিশ্চিত করুন (Confirm Password)</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ডটি আবার লিখুন"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md cursor-pointer mt-2"
              >
                পাসওয়ার্ড আপডেট করুন
              </button>
            </form>
          )}

          {/* TAB 3: Switch Role */}
          {activeTab === 'switch' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-[11px] leading-relaxed">
                <span className="font-bold block text-indigo-300 mb-1">🏢 সেন্ট্রাল ডাটাবেজ তথ্য:</span>
                আপনি টিচার, অ্যাডমিন বা যেকোনো অ্যাকাউন্টে সুইচ করলেও স্কুলের সকল ডেটা একই কেন্দ্রীয় স্টোরেজে সংরক্ষিত থাকে। টিচার হিসেবে যে হাজিরা বা মার্কস এন্ট্রি করবেন, তা অ্যাডমিন বা একাউন্ট্যান্ট সাথে সাথে দেখতে পাবেন।
              </div>

              <p className="text-slate-400 text-xs">
                নিচের যেকোনো ব্যবহারকারী প্রোফাইলে সাথে সাথে সুইচ করতে ক্লিক করুন:
              </p>
              <div className="space-y-2">
                {INITIAL_USERS.map((usr) => {
                  const isCurrent = usr.id === currentUser.id;
                  return (
                    <button
                      key={usr.id}
                      onClick={() => {
                        const { passwordHash: _, ...safeUser } = usr;
                        setStoredCurrentUser(safeUser);
                        onSwitchUser(safeUser);
                        onClose();
                      }}
                      disabled={isCurrent}
                      className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                        isCurrent
                          ? 'bg-blue-950/40 border-blue-500/50 text-blue-300 opacity-80 cursor-default'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/60 cursor-pointer'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{usr.name}</span>
                          {isCurrent && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">বর্তমান</span>}
                        </div>
                        <div className="text-[11px] text-slate-400">{usr.roleTitle}</div>
                      </div>
                      {getRoleBadge(usr.role)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer: Logout Button */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            লগইন সেশন সুরক্ষিত রয়েছে
          </div>
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>লগআউট করুন (Logout)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
