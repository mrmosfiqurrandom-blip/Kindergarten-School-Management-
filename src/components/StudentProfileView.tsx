import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Droplet,
  CreditCard,
  GraduationCap,
  CalendarCheck,
  Printer,
  Receipt,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Edit2,
  X,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Share2,
  QrCode,
  School,
  AlertCircle,
  Clock,
  ArrowRight,
  Send,
} from 'lucide-react';
import {
  Student,
  FeeRecord,
  AcademicResult,
  AttendanceRecord,
  SchoolInfo,
  StudentClass,
  Section,
  BloodGroup,
  StudentStatus,
} from '../types';
import { ActiveTab } from './Navigation';

interface StudentProfileViewProps {
  students: Student[];
  fees: FeeRecord[];
  results: AcademicResult[];
  attendance: AttendanceRecord[];
  schoolInfo: SchoolInfo;
  selectedStudentId?: string;
  onNavigate: (tab: ActiveTab) => void;
  onUpdateStudent?: (student: Student) => void;
  onSelectStudentForReceipt?: (studentId: string, month: string) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  students,
  fees,
  results,
  attendance,
  schoolInfo,
  selectedStudentId: initialSelectedId,
  onNavigate,
  onUpdateStudent,
  onSelectStudentForReceipt,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    initialSelectedId || (students[0] ? students[0].id : 'KS-101')
  );

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modals & Popups
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  // Edit Student Form State
  const [editFormData, setEditFormData] = useState<Student | null>(null);

  // Filter students based on search query and filters
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.nameBn.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.rollNo.toString().includes(q) ||
        s.contactNumber.toLowerCase().includes(q) ||
        s.fatherName.toLowerCase().includes(q) ||
        s.motherName.toLowerCase().includes(q) ||
        s.bloodGroup.toLowerCase().includes(q) ||
        s.studentClass.toLowerCase().includes(q);

      const matchesClass = classFilter === 'All' || s.studentClass === classFilter;
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;

      return matchesQuery && matchesClass && matchesStatus;
    });
  }, [students, searchQuery, classFilter, statusFilter]);

  // Current active student
  const student = students.find((s) => s.id === selectedId) || filteredStudents[0] || students[0];
  const studentFees = fees.filter((f) => f.studentId === student?.id);
  const studentResult = results.find((r) => r.studentId === student?.id);
  const studentAttendance = attendance.filter((a) => a.studentId === student?.id);

  // Financial calculations
  const totalBilled = studentFees.reduce((acc, f) => acc + f.totalPayable, 0);
  const totalPaid = studentFees.reduce((acc, f) => acc + f.amountPaid, 0);
  const currentDue = studentFees.reduce((acc, f) => acc + f.dueAmount, 0);

  // Attendance metrics
  const totalRecordedDays = studentAttendance.length > 0 ? studentAttendance.length : 10;
  const presentDays =
    studentAttendance.length > 0
      ? studentAttendance.filter((a) => a.status === 'Present').length
      : student?.id === 'KS-104'
      ? 6
      : student?.id === 'KS-108'
      ? 4
      : 10;
  const absentDays = Math.max(totalRecordedDays - presentDays, 0);
  const attendanceRate = Math.round((presentDays / totalRecordedDays) * 100);

  // Index in list for Prev / Next
  const currentIndex = students.findIndex((s) => s.id === student?.id);
  const handlePrevStudent = () => {
    if (currentIndex > 0) {
      setSelectedId(students[currentIndex - 1].id);
    } else {
      setSelectedId(students[students.length - 1].id);
    }
  };

  const handleNextStudent = () => {
    if (currentIndex < students.length - 1) {
      setSelectedId(students[currentIndex + 1].id);
    } else {
      setSelectedId(students[0].id);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = () => {
    if (!student) return;
    setEditFormData({ ...student });
    setIsEditModalOpen(true);
  };

  // Save Edit Student
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;
    if (onUpdateStudent) {
      onUpdateStudent(editFormData);
    }
    setIsEditModalOpen(false);
    showToast('শিক্ষার্থীর তথ্য সফলভাবে আপডেট হয়েছে!');
  };

  const showToast = (msg: string) => {
    setCopiedToast(msg);
    setTimeout(() => setCopiedToast(null), 3000);
  };

  // WhatsApp Message Generator
  const generateWhatsAppMessage = () => {
    if (!student) return '';
    const latestMonth = studentFees[0]?.month || 'চলতি মাস';
    return `আসসালামু আলাইকুম।
${schoolInfo.nameBn}-এর পক্ষ থেকে সম্মানিত অভিভাবকের দৃষ্টি আকর্ষণ করছি।
শিক্ষার্থীর নাম: ${student.nameBn} (${student.name})
আইডি: ${student.id}, ক্লাস: ${student.studentClass}, রোল: ${student.rollNo}

${
  currentDue > 0
    ? `বকেয়া ফি বিবরণী (${latestMonth}):
মোট বকেয়া: ৳${currentDue.toLocaleString()}
অনুগ্রহ করে দ্রুততম সময়ে উক্ত বকেয়া পরিশোধ করার জন্য বিনীত অনুরোধ করা হচ্ছে।`
    : `সকল ফি পরিশোধিত রয়েছে। ধন্যবাদ!`
}

স্কুল হেল্পলাইন: ${schoolInfo.phone}
ঠিকানা: ${schoolInfo.address}`;
  };

  const handleOpenWhatsApp = () => {
    if (!student) return;
    const cleanPhone = student.contactNumber.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
    const text = encodeURIComponent(generateWhatsAppMessage());
    window.open(`https://wa.me/${phoneWithCountry}?text=${text}`, '_blank');
  };

  const handleCopyWhatsAppText = () => {
    navigator.clipboard.writeText(generateWhatsAppMessage());
    showToast('মেসেজ টেক্সট কপি হয়েছে!');
  };

  const handlePrintFullProfile = () => {
    window.print();
  };

  if (!student) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">কোন শিক্ষার্থী পাওয়া যায়নি</h3>
        <p className="text-xs text-slate-400 mt-1">অনুগ্রহ করে ফিল্টার পরিবর্তন করুন বা নতুন শিক্ষার্থী যুক্ত করুন।</p>
      </div>
    );
  }

  const classList: (StudentClass | 'All')[] = [
    'All',
    'Play',
    'Nursery',
    'KG',
    'Class 1',
    'Class 2',
    'Class 3',
    'Class 4',
    'Class 5',
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-emerald-500/50 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{copiedToast}</span>
        </div>
      )}

      {/* TOP SEARCH & STUDENT PICKER PANEL */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 space-y-4 print:hidden">
        {/* Title and Top Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" />
                <span>Student Profile & Search Explorer</span>
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                Sheet 3: ডিজিটাল প্রোফাইল
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              নাম, আইডি, রোল, ক্লাস বা ফোন নম্বর দিয়ে যেকোনো শিক্ষার্থী তাৎক্ষণিক সার্চ করুন
            </p>
          </div>

          {/* Quick Prev / Next Navigator */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handlePrevStudent}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Previous Student"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">পূর্ববর্তী</span>
            </button>

            <span className="text-xs font-mono font-bold text-slate-600 px-2 py-1 bg-slate-50 rounded-md border border-slate-200">
              {currentIndex + 1} / {students.length}
            </span>

            <button
              onClick={handleNextStudent}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Next Student"
            >
              <span className="hidden sm:inline">পরবর্তী</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Search Bar and Dropdown Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Main Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="শিক্ষার্থীর নাম, আইডি (KS-101), রোল, ফোন বা পিতার নাম লিখুন..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/70"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Student Dropdown Selector */}
          <div className="sm:col-span-4">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-amber-50/80 border-2 border-amber-300 font-mono font-bold text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              {filteredStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} — {s.name} ({s.studentClass}, Roll: {s.rollNo})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-700"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Class Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            ক্লাস ফিল্টার:
          </span>
          {classList.map((cls) => (
            <button
              key={cls}
              onClick={() => setClassFilter(cls)}
              className={`px-3 py-1 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                classFilter === cls
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cls === 'All' ? 'সকল ক্লাস (All)' : cls}
            </button>
          ))}
        </div>

        {/* Matching Students Quick Carousel / Badges */}
        {filteredStudents.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500">
                পাওয়া গেছে: <b className="text-slate-800">{filteredStudents.length}</b> জন শিক্ষার্থী
              </span>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setClassFilter('All');
                    setStatusFilter('All');
                  }}
                  className="text-[11px] text-blue-600 hover:underline font-semibold"
                >
                  ফিল্টার ক্লিয়ার করুন
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-300">
              {filteredStudents.slice(0, 15).map((s) => {
                const isCurrent = s.id === student?.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-left shrink-0 transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-300'
                        : 'bg-slate-50 hover:bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCurrent ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {s.name.charAt(0)}
                    </div>
                    <div className="leading-tight">
                      <div className="text-xs font-bold truncate max-w-[120px]">{s.name}</div>
                      <div className={`text-[10px] ${isCurrent ? 'text-blue-100' : 'text-slate-400'}`}>
                        {s.id} • {s.studentClass}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* MAIN DOSSIER & PROFILE ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Student Identity Card & Primary Actions */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 flex flex-col justify-between space-y-6">
          <div>
            {/* Top Avatar & Status Row */}
            <div className="flex items-start justify-between">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-500/20 border-2 border-white">
                  {student.name.charAt(0)}
                </div>
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px] shadow-xs">
                  {student.bloodGroup}
                </span>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    student.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-700 border border-slate-300'
                  }`}
                >
                  {student.status === 'Active' ? '🟢 নিয়মিত (Active)' : '⚪ অনিয়মিত'}
                </span>

                <button
                  onClick={handleOpenEdit}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Edit Student Info"
                >
                  <Edit2 className="w-3 h-3 text-blue-600" />
                  <span>তথ্য এডিট</span>
                </button>
              </div>
            </div>

            {/* Student Name & Core Badges */}
            <div className="mt-4">
              <h3 className="text-xl font-bold text-slate-900">{student.name}</h3>
              <div className="text-sm font-semibold text-slate-600">{student.nameBn}</div>

              <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  ID: {student.id}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-semibold">
                  Class: {student.studentClass} ({student.section})
                </span>
                <span className="text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-200">
                  Roll #{student.rollNo}
                </span>
              </div>
            </div>

            {/* Information Key-Value Pairs */}
            <div className="mt-5 space-y-2.5 text-xs border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">পিতার নাম:</span>
                <span className="font-bold text-slate-800">{student.fatherName}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">মাতার নাম:</span>
                <span className="font-bold text-slate-800">{student.motherName}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> যোগাযোগের ফোন:
                </span>
                <a
                  href={`tel:${student.contactNumber}`}
                  className="font-mono font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  {student.contactNumber}
                </a>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">জরুরি ফোন:</span>
                <span className="font-mono font-bold text-slate-800">{student.emergencyContact}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> ঠিকানা:
                </span>
                <span className="font-medium text-slate-700 text-right max-w-[180px] truncate" title={student.address}>
                  {student.address}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> ভর্তির তারিখ:
                </span>
                <span className="font-mono text-slate-700">{student.admissionDate}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5 text-rose-500" /> রক্তের গ্রুপ:
                </span>
                <span className="font-bold text-rose-600 px-2 py-0.5 bg-rose-50 rounded border border-rose-200">
                  {student.bloodGroup}
                </span>
              </div>
            </div>
          </div>

          {/* Action Hub Buttons (100% Workable) */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {/* ID Card Generator Button */}
              <button
                onClick={() => setIsIdCardModalOpen(true)}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95"
              >
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>আইডি কার্ড</span>
              </button>

              {/* Print Full Dossier */}
              <button
                onClick={handlePrintFullProfile}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-300 hover:scale-[1.02] active:scale-95"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>প্রোফাইল প্রিন্ট</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* WhatsApp Alert Button */}
              <button
                onClick={() => setIsWhatsAppModalOpen(true)}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-700/20 hover:scale-[1.02] active:scale-95"
              >
                <MessageSquare className="w-4 h-4 text-emerald-200" />
                <span>হোয়াটসঅ্যাপ নোটিশ</span>
              </button>

              {/* Money Receipt Generator */}
              <button
                onClick={() => {
                  if (onSelectStudentForReceipt) {
                    onSelectStudentForReceipt(student.id, studentFees[0]?.month || 'January 2025');
                  }
                  onNavigate('receipt');
                }}
                className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-blue-700/20 hover:scale-[1.02] active:scale-95"
              >
                <Receipt className="w-4 h-4 text-blue-200" />
                <span>মানি রসিদ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Overview + Attendance + Academic Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Financial Ledger & Fee Status */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Financial Ledger & Fee Status (ফি ও লেনদেন হিসাব)</span>
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    currentDue === 0
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {currentDue === 0 ? '✅ কোনো বকেয়া নেই (Paid)' : `⚠️ বকেয়া: ৳${currentDue.toLocaleString()}`}
                </span>
                <button
                  onClick={() => onNavigate('fees')}
                  className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-0.5"
                >
                  ফি খাতা <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-slate-500 font-medium">মোট ধার্যকৃত ফি</div>
                <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  ৳{totalBilled.toLocaleString()}
                </div>
              </div>
              <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200">
                <div className="text-emerald-700 font-medium">মোট পরিশোধিত</div>
                <div className="text-base sm:text-lg font-bold text-emerald-800 mt-0.5">
                  ৳{totalPaid.toLocaleString()}
                </div>
              </div>
              <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200">
                <div className="text-amber-800 font-medium">বকেয়া পাওনা</div>
                <div className="text-base sm:text-lg font-bold text-amber-900 mt-0.5">
                  ৳{currentDue.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Fees Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold">
                    <th className="py-2 px-2.5 rounded-l">মাস / বিবরণ</th>
                    <th className="py-2 px-2.5 text-right">ধার্য (Payable)</th>
                    <th className="py-2 px-2.5 text-right">পরিশোধ (Paid)</th>
                    <th className="py-2 px-2.5 text-right">বকেয়া (Due)</th>
                    <th className="py-2 px-2.5 text-center">স্ট্যাটাস</th>
                    <th className="py-2 px-2.5 text-right rounded-r">রসিদ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentFees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-slate-400">
                        এই শিক্ষার্থীর কোনো ফি রেকর্ড এখনো যুক্ত হয়নি।
                      </td>
                    </tr>
                  ) : (
                    studentFees.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-2.5 font-medium text-slate-800">
                          <div>{f.month}</div>
                          <div className="text-[10px] text-slate-400">{f.paymentDate || 'তারিখ নেই'}</div>
                        </td>
                        <td className="py-2.5 px-2.5 text-right text-slate-600">৳{f.totalPayable.toLocaleString()}</td>
                        <td className="py-2.5 px-2.5 text-right text-emerald-700 font-semibold">
                          ৳{f.amountPaid.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2.5 text-right text-amber-700 font-semibold">
                          ৳{f.dueAmount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              f.paymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : f.paymentStatus === 'Partial'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {f.paymentStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 text-right">
                          <button
                            onClick={() => {
                              if (onSelectStudentForReceipt) {
                                onSelectStudentForReceipt(student.id, f.month);
                              }
                              onNavigate('receipt');
                            }}
                            className="p-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                            title="Print Money Receipt"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Attendance & Participation */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                <span>Attendance & Participation (উপস্থিতির রেকর্ড ও হার)</span>
              </h3>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  attendanceRate >= 75
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {attendanceRate}% উপস্থিতি
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all ${
                  attendanceRate >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                style={{ width: `${attendanceRate}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="text-slate-500 text-[11px]">মোট কর্মদিবস</div>
                <div className="font-bold text-slate-800 text-sm mt-0.5">{totalRecordedDays} দিন</div>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                <div className="text-emerald-700 text-[11px]">উপস্থিত (Present)</div>
                <div className="font-bold text-emerald-800 text-sm mt-0.5">{presentDays} দিন</div>
              </div>
              <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                <div className="text-rose-700 text-[11px]">অনুপস্থিত (Absent)</div>
                <div className="font-bold text-rose-800 text-sm mt-0.5">{absentDays} দিন</div>
              </div>
            </div>
          </div>

          {/* 3. Academic Examination Performance */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Academic Examination Performance (একাডেমিক ফলাফল ও মূল্যায়ন)</span>
              </h3>
              {studentResult ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    গ্রেড: {studentResult.grade} (GPA {studentResult.gpa.toFixed(2)})
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {studentResult.term}
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => onNavigate('results')}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  + রেজাল্ট এন্ট্রি করুন
                </button>
              )}
            </div>

            {studentResult ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="text-slate-500 text-[11px]">বাংলা</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{studentResult.bangla}</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="text-slate-500 text-[11px]">English</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{studentResult.english}</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="text-slate-500 text-[11px]">গণিত</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{studentResult.math}</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="text-slate-500 text-[11px]">সাধারণ জ্ঞান</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{studentResult.gk}</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="text-slate-500 text-[11px]">বিজ্ঞান</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{studentResult.science}</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="text-slate-500 text-[11px]">ড্রয়িং</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{studentResult.drawing}</div>
                  </div>
                </div>

                <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-slate-500">মোট প্রাপ্ত নম্বর:</span>{' '}
                    <span className="font-bold text-slate-900">{studentResult.totalMarks} / 600</span>{' '}
                    <span className="text-slate-600 font-semibold">({studentResult.averageMarks.toFixed(1)}%)</span>
                  </div>
                  <div className="text-slate-700 italic">
                    শিক্ষকের মন্তব্য: <b>"{studentResult.remarks}"</b>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                এই টার্মের পরীক্ষার মার্কশিট এখনও তৈরি করা হয়নি।
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. STUDENT ID CARD PRINT MODAL */}
      {/* ========================================================================= */}
      {isIdCardModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">ডিজিটাল স্টুডেন্ট আইডি কার্ড (ID Card)</h3>
              </div>
              <button
                onClick={() => setIsIdCardModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable ID Card Visual (Front & Back Preview) */}
            <div id="printable-id-card" className="space-y-4">
              {/* FRONT SIDE */}
              <div className="w-full bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-xl border-2 border-amber-400 relative overflow-hidden">
                {/* Decorative background circle */}
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-400/10 rounded-full blur-xl pointer-events-none"></div>

                {/* School Header */}
                <div className="flex items-center gap-2.5 pb-3 border-b border-white/20">
                  <div className="w-9 h-9 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center text-lg font-black shadow-md shrink-0">
                    ☀️
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-xs sm:text-sm tracking-wide text-amber-300 uppercase truncate">
                      {schoolInfo.name}
                    </h4>
                    <p className="text-[10px] text-slate-300 truncate">{schoolInfo.nameBn}</p>
                  </div>
                </div>

                {/* Body Content */}
                <div className="py-3 flex items-center gap-3.5">
                  <div className="w-20 h-24 rounded-xl bg-slate-800 border-2 border-amber-300 flex flex-col items-center justify-center text-center p-1 shrink-0 shadow-md">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-black mb-1">
                      {student.name.charAt(0)}
                    </div>
                    <span className="text-[9px] font-bold text-amber-300 uppercase">STUDENT</span>
                  </div>

                  <div className="flex-1 space-y-1 text-xs">
                    <h3 className="font-black text-sm text-white">{student.name}</h3>
                    <div className="text-[11px] text-slate-300 font-semibold">{student.nameBn}</div>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] pt-1">
                      <div>
                        <span className="text-slate-400">ID No:</span>{' '}
                        <b className="text-amber-300 font-mono">{student.id}</b>
                      </div>
                      <div>
                        <span className="text-slate-400">Class:</span> <b>{student.studentClass}</b>
                      </div>
                      <div>
                        <span className="text-slate-400">Roll:</span> <b>#{student.rollNo}</b>
                      </div>
                      <div>
                        <span className="text-slate-400">Blood:</span>{' '}
                        <b className="text-rose-300">{student.bloodGroup}</b>
                      </div>
                      <div className="col-span-2 truncate">
                        <span className="text-slate-400">Guardian:</span> <b>{student.fatherName}</b>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer of ID Card */}
                <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[9px] text-slate-300">
                  <span className="font-mono">Phone: {student.contactNumber}</span>
                  <span className="font-bold text-amber-300">VALID: DEC 2025</span>
                </div>
              </div>

              {/* BACK SIDE */}
              <div className="w-full bg-slate-100 text-slate-800 rounded-2xl p-4 border border-slate-300 text-xs space-y-2">
                <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 text-[11px] flex justify-between">
                  <span>জরুরি নির্দেশিকা (Instructions)</span>
                  <span className="text-[10px] text-slate-500 font-normal">Card Issue: {student.admissionDate}</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  ১. এই কার্ডটি শিক্ষার্থীর সার্বক্ষণিক সাথে রাখা বাধ্যতামূলক।<br />
                  ২. কার্ড হারিয়ে গেলে অবিলম্বে স্কুল কর্তৃপক্ষকে অবহিত করতে হবে।<br />
                  ৩. কার্ডটি পাওয়া গেলে নিচে দেওয়া ঠিকানায় পৌঁছে দেওয়ার অনুরোধ করা হচ্ছে।
                </p>
                <div className="pt-1 text-[10px] text-slate-700 flex justify-between items-end">
                  <div>
                    <b>{schoolInfo.name}</b><br />
                    <span>{schoolInfo.address}</span><br />
                    <span>হেল্পলাইন: {schoolInfo.phone}</span>
                  </div>
                  <div className="text-right">
                    <div className="h-6 flex items-end justify-end">
                      <span className="font-serif italic text-[11px] text-blue-900 font-bold">Principal Sign</span>
                    </div>
                    <div className="border-t border-slate-400 text-[9px] text-slate-500 mt-0.5">অধ্যক্ষের স্বাক্ষর</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsIdCardModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>আইডি কার্ড প্রিন্ট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. WHATSAPP & SMS ALERT MODAL */}
      {/* ========================================================================= */}
      {isWhatsAppModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">অভিভাবককে হোয়াটসঅ্যাপ / এসএমএস নোটিশ</h3>
              </div>
              <button
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-emerald-700 font-semibold">অভিভাবকের মোবাইল:</span>
                  <div className="font-mono font-bold text-emerald-950 text-sm">{student.contactNumber}</div>
                </div>
                <div className="text-right">
                  <span className="text-emerald-700 font-semibold">বর্তমান বকেয়া:</span>
                  <div className="font-bold text-amber-800 text-sm">৳{currentDue.toLocaleString()}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">প্রস্তুতকৃত নোটিশ মেসেজ:</label>
                <textarea
                  readOnly
                  rows={8}
                  value={generateWhatsAppMessage()}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 font-mono text-xs text-slate-800 leading-relaxed focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
              <button
                onClick={handleCopyWhatsAppText}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>টেক্সট কপি করুন</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsWhatsAppModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleOpenWhatsApp}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>হোয়াটসঅ্যাপে পাঠান</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. EDIT STUDENT INFORMATION MODAL */}
      {/* ========================================================================= */}
      {isEditModalOpen && editFormData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  শিক্ষার্থীর তথ্য সংশোধন করুন ({editFormData.id})
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">শিক্ষার্থীর নাম (English):</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">শিক্ষার্থীর নাম (বাংলা):</label>
                  <input
                    type="text"
                    required
                    value={editFormData.nameBn}
                    onChange={(e) => setEditFormData({ ...editFormData, nameBn: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">শ্রেণি (Class):</label>
                  <select
                    value={editFormData.studentClass}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, studentClass: e.target.value as StudentClass })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900"
                  >
                    {classList.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">রোল নম্বর (Roll No):</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editFormData.rollNo}
                    onChange={(e) => setEditFormData({ ...editFormData, rollNo: parseInt(e.target.value) || 1 })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">পিতার নাম:</label>
                  <input
                    type="text"
                    required
                    value={editFormData.fatherName}
                    onChange={(e) => setEditFormData({ ...editFormData, fatherName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">মাতার নাম:</label>
                  <input
                    type="text"
                    required
                    value={editFormData.motherName}
                    onChange={(e) => setEditFormData({ ...editFormData, motherName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">অভিভাবকের মোবাইল:</label>
                  <input
                    type="text"
                    required
                    value={editFormData.contactNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, contactNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">রক্তের গ্রুপ:</label>
                  <select
                    value={editFormData.bloodGroup}
                    onChange={(e) => setEditFormData({ ...editFormData, bloodGroup: e.target.value as BloodGroup })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">ঠিকানা (Address):</label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ভর্তির তারিখ:</label>
                  <input
                    type="date"
                    value={editFormData.admissionDate}
                    onChange={(e) => setEditFormData({ ...editFormData, admissionDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">স্ট্যাটাস (Status):</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, status: e.target.value as StudentStatus })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900"
                  >
                    <option value="Active">Active (নিয়মিত)</option>
                    <option value="Inactive">Inactive (অনিয়মিত)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
