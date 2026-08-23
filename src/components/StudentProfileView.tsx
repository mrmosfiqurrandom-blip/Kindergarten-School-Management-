import React, { useState } from 'react';
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
} from 'lucide-react';
import { Student, FeeRecord, AcademicResult, AttendanceRecord, SchoolInfo } from '../types';
import { ActiveTab } from './Navigation';

interface StudentProfileViewProps {
  students: Student[];
  fees: FeeRecord[];
  results: AcademicResult[];
  attendance: AttendanceRecord[];
  schoolInfo: SchoolInfo;
  selectedStudentId?: string;
  onNavigate: (tab: ActiveTab) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  students,
  fees,
  results,
  attendance,
  schoolInfo,
  selectedStudentId: initialSelectedId,
  onNavigate,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    initialSelectedId || (students[0] ? students[0].id : 'KS-101')
  );

  const student = students.find((s) => s.id === selectedId) || students[0];
  const studentFees = fees.filter((f) => f.studentId === selectedId);
  const studentResult = results.find((r) => r.studentId === selectedId);

  const totalBilled = studentFees.reduce((acc, f) => acc + f.totalPayable, 0);
  const totalPaid = studentFees.reduce((acc, f) => acc + f.amountPaid, 0);
  const currentDue = studentFees.reduce((acc, f) => acc + f.dueAmount, 0);

  // Mock attendance calculation
  const totalSchoolDays = 10;
  const isAbsentSample = student?.id === 'KS-104' ? 4 : student?.id === 'KS-108' ? 6 : 0;
  const presentDays = Math.max(totalSchoolDays - isAbsentSample, 0);
  const attendanceRate = Math.round((presentDays / totalSchoolDays) * 100);

  if (!student) {
    return <div className="p-8 text-center text-slate-500">No student selected.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Selector & Header */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">🔍 Dynamic Student Profile (XLOOKUP Engine)</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold">
              Sheet 3: ডিজিটাল প্রোফাইল
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            এক্সেলের <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-bold">=XLOOKUP(C6, Database!A:A, Database!B:B)</code> দ্বারা সরাসরি পরিচালিত
          </p>
        </div>

        {/* Student Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Select Student:</label>
          <div className="relative">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="px-4 py-2 pr-8 rounded-xl bg-amber-50 border-2 border-amber-400 font-mono font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-sm"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} — {s.name} ({s.studentClass})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Profile Dossier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Identity Card */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/20">
                {student.name.charAt(0)}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  student.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-700 border border-slate-300'
                }`}
              >
                {student.status}
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-bold text-slate-900">{student.name}</h3>
              <div className="text-sm font-semibold text-slate-500">{student.nameBn}</div>
              <div className="mt-2 flex items-center gap-2">
                <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  ID: {student.id}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                  Class: {student.studentClass}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                  Roll: #{student.rollNo}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-xs border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Father's Name:</span>
                <span className="font-bold text-slate-800">{student.fatherName}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Mother's Name:</span>
                <span className="font-bold text-slate-800">{student.motherName}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" /> Contact Phone:
                </span>
                <span className="font-mono font-bold text-slate-800">{student.contactNumber}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Emergency:</span>
                <span className="font-mono text-slate-700">{student.emergencyContact}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> Address:
                </span>
                <span className="font-medium text-slate-700 text-right max-w-[180px] truncate">{student.address}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> Admission Date:
                </span>
                <span className="font-mono text-slate-700">{student.admissionDate}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 flex items-center gap-1">
                  <Droplet className="w-3 h-3 text-rose-500" /> Blood Group:
                </span>
                <span className="font-bold text-rose-600 px-2 py-0.5 bg-rose-50 rounded border border-rose-200">
                  {student.bloodGroup}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
            <button
              onClick={() => onNavigate('receipt')}
              className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Money Receipt</span>
            </button>
            <button
              onClick={() => onNavigate('due_alerts')}
              className="py-2 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-amber-300"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
            </button>
          </div>
        </div>

        {/* Right Details Panel: Financial + Attendance + Academic */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance & Engagement Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                <span>Attendance & Class Participation (উপস্থিতির রেকর্ড)</span>
              </h3>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                attendanceRate >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {attendanceRate}% Attendance
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

            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="text-slate-500 text-[11px]">Total Days</div>
                <div className="font-bold text-slate-800">{totalSchoolDays} Days</div>
              </div>
              <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                <div className="text-emerald-700 text-[11px]">Present</div>
                <div className="font-bold text-emerald-800">{presentDays} Days</div>
              </div>
              <div className="bg-rose-50 p-2 rounded-lg border border-rose-100">
                <div className="text-rose-700 text-[11px]">Absent</div>
                <div className="font-bold text-rose-800">{totalSchoolDays - presentDays} Days</div>
              </div>
            </div>
          </div>

          {/* Financial Overview Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Financial Ledger & Fee Status (ফি ও লেনদেন)</span>
              </h3>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                currentDue === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {currentDue === 0 ? 'Paid in Full' : `Due: ৳${currentDue.toLocaleString()}`}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs mb-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-slate-500 font-medium">Total Billed</div>
                <div className="text-lg font-bold text-slate-900 mt-1">৳{totalBilled.toLocaleString()}</div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <div className="text-emerald-700 font-medium">Amount Paid</div>
                <div className="text-lg font-bold text-emerald-800 mt-1">৳{totalPaid.toLocaleString()}</div>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <div className="text-amber-800 font-medium">Due Balance</div>
                <div className="text-lg font-bold text-amber-800 mt-1">৳{currentDue.toLocaleString()}</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold">
                    <th className="py-2 px-2.5 rounded-l">Month</th>
                    <th className="py-2 px-2.5 text-right">Payable</th>
                    <th className="py-2 px-2.5 text-right">Paid</th>
                    <th className="py-2 px-2.5 text-right">Due</th>
                    <th className="py-2 px-2.5 text-center rounded-r">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentFees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-3 text-center text-slate-400">
                        No billing history recorded yet.
                      </td>
                    </tr>
                  ) : (
                    studentFees.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50">
                        <td className="py-2 px-2.5 font-medium text-slate-800">{f.month}</td>
                        <td className="py-2 px-2.5 text-right text-slate-600">৳{f.totalPayable.toLocaleString()}</td>
                        <td className="py-2 px-2.5 text-right text-emerald-700 font-semibold">
                          ৳{f.amountPaid.toLocaleString()}
                        </td>
                        <td className="py-2 px-2.5 text-right text-amber-700 font-semibold">
                          ৳{f.dueAmount.toLocaleString()}
                        </td>
                        <td className="py-2 px-2.5 text-center">
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Academic Snapshot Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Academic Examination Performance (একাডেমিক ফলাফল)</span>
              </h3>
              {studentResult && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Grade: {studentResult.grade} (GPA {studentResult.gpa.toFixed(2)})
                </span>
              )}
            </div>

            {studentResult ? (
              <div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs mb-3">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="text-slate-500 text-[10px]">Bangla</div>
                    <div className="font-bold text-slate-800 text-sm">{studentResult.bangla}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="text-slate-500 text-[10px]">English</div>
                    <div className="font-bold text-slate-800 text-sm">{studentResult.english}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="text-slate-500 text-[10px]">Math</div>
                    <div className="font-bold text-slate-800 text-sm">{studentResult.math}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="text-slate-500 text-[10px]">GK</div>
                    <div className="font-bold text-slate-800 text-sm">{studentResult.gk}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="text-slate-500 text-[10px]">Science</div>
                    <div className="font-bold text-slate-800 text-sm">{studentResult.science}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="text-slate-500 text-[10px]">Drawing</div>
                    <div className="font-bold text-slate-800 text-sm">{studentResult.drawing}</div>
                  </div>
                </div>

                <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-slate-500">Total Marks:</span>{' '}
                    <span className="font-bold text-slate-900">{studentResult.totalMarks} / 600</span>{' '}
                    <span className="text-slate-400">({studentResult.averageMarks.toFixed(1)}%)</span>
                  </div>
                  <div className="text-slate-600 italic">"{studentResult.remarks}"</div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-3 text-center">
                Exam marksheet not yet generated for this term.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
