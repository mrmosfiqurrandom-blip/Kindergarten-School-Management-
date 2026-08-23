import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Check,
  X,
  AlertTriangle,
  Users,
  Filter,
  Sparkles,
  Save,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { Student, StudentClass, AttendanceRecord, User } from '../types';

interface AttendanceViewProps {
  students: Student[];
  attendance?: AttendanceRecord[];
  onSaveAttendance?: (records: AttendanceRecord[]) => void;
  currentUser?: User | null;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  attendance,
  onSaveAttendance,
  currentUser,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('All');
  
  // 10 School Days attendance status state
  const [attendanceMatrix, setAttendanceMatrix] = useState<Record<string, ('P' | 'A')[]>>(() => {
    const initial: Record<string, ('P' | 'A')[]> = {};
    students.forEach((s) => {
      if (s.id === 'KS-104') {
        initial[s.id] = ['A', 'P', 'A', 'P', 'A', 'P', 'P', 'P', 'A', 'P'];
      } else if (s.id === 'KS-108') {
        initial[s.id] = ['A', 'A', 'P', 'A', 'P', 'A', 'P', 'A', 'P', 'A'];
      } else if (s.id === 'KS-102') {
        initial[s.id] = ['P', 'P', 'A', 'P', 'P', 'P', 'P', 'P', 'P', 'P'];
      } else {
        initial[s.id] = ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'];
      }
    });
    return initial;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10'];

  const filteredStudents = students.filter(
    (s) => selectedClass === 'All' || s.studentClass === selectedClass
  );

  const toggleStatus = (studentId: string, dayIndex: number) => {
    setAttendanceMatrix((prev) => {
      const current = prev[studentId] || Array(10).fill('P');
      const updated = [...current];
      updated[dayIndex] = updated[dayIndex] === 'P' ? 'A' : 'P';
      return { ...prev, [studentId]: updated };
    });
    setSavedSuccess(false);
  };

  const markAllDay = (dayIndex: number, status: 'P' | 'A') => {
    setAttendanceMatrix((prev) => {
      const updated = { ...prev };
      filteredStudents.forEach((s) => {
        const studentDays = [...(updated[s.id] || Array(10).fill('P'))];
        studentDays[dayIndex] = status;
        updated[s.id] = studentDays;
      });
      return updated;
    });
    setSavedSuccess(false);
  };

  const handleSaveAttendance = () => {
    // Generate full AttendanceRecord list for central persistence
    const generatedRecords: AttendanceRecord[] = [];
    const baseDate = new Date();

    Object.keys(attendanceMatrix).forEach((studentId) => {
      const dayStatuses = attendanceMatrix[studentId] || [];
      dayStatuses.forEach((status, idx) => {
        const recordDate = new Date(baseDate);
        recordDate.setDate(recordDate.getDate() - (9 - idx));
        const dateStr = recordDate.toISOString().split('T')[0];

        generatedRecords.push({
          id: `ATT-${studentId}-D${idx + 1}`,
          studentId,
          date: dateStr,
          status: status === 'P' ? 'Present' : 'Absent',
        });
      });
    });

    if (onSaveAttendance) {
      onSaveAttendance(generatedRecords);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Central Persistence & Teacher Role Indicator */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs border border-indigo-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 font-bold shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">সেন্ট্রাল স্কুল ডাটাবেজ অটো-সেভ</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                ✓ লাইভ সিঙ্ক অ্যাক্টিভ
              </span>
            </div>
            <p className="text-slate-300 text-[11px] mt-0.5">
              {currentUser ? `লগইন আছেন: ${currentUser.name} (${currentUser.roleTitle})` : 'শিক্ষক ও অ্যাডমিন মোড'} — এখানে সেভ করা হাজিরা সরাসরি কেন্দ্রীয় ডাটাবেজ ও গুগল শিটে আপডেট হবে।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 font-mono">
            {filteredStudents.length} জন শিক্ষার্থী লোড
          </span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">📅 Daily Attendance Register & Tracker</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              Sheet 4: উপস্থিতি খাতা
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            অটোমেটিক <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-bold">=COUNTIF()</code> এবং ৭৫%-এর নিচে উপস্থিতি হলে লাল ওয়ার্নিং অ্যালার্ট
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-600 font-medium">Filter Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="All">All Classes (সব)</option>
              {['Play', 'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSaveAttendance}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{savedSuccess ? 'Saved! (সংরক্ষিত)' : 'Save Record'}</span>
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold whitespace-nowrap">
                <th className="py-3 px-3.5">ID</th>
                <th className="py-3 px-3.5">Student Name</th>
                <th className="py-3 px-2.5 text-center">Class</th>
                <th className="py-3 px-2 text-center">Roll</th>
                {days.map((d, i) => (
                  <th key={d} className="py-2.5 px-2 text-center border-l border-slate-800">
                    <div>{d}</div>
                    <div className="flex justify-center gap-1 mt-1">
                      <button
                        onClick={() => markAllDay(i, 'P')}
                        title="Mark all Present"
                        className="text-[9px] px-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-mono cursor-pointer"
                      >
                        All P
                      </button>
                    </div>
                  </th>
                ))}
                <th className="py-3 px-3 text-center bg-emerald-950/80">Present</th>
                <th className="py-3 px-3 text-center bg-rose-950/80">Absent</th>
                <th className="py-3 px-3.5 text-center bg-blue-950">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStudents.map((s, idx) => {
                const sDays = attendanceMatrix[s.id] || Array(10).fill('P');
                const presentCount = sDays.filter((st) => st === 'P').length;
                const absentCount = sDays.filter((st) => st === 'A').length;
                const totalDays = presentCount + absentCount;
                const rate = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 100;
                const isBelowThreshold = rate < 75;

                return (
                  <tr
                    key={s.id}
                    className={`hover:bg-blue-50/40 transition-colors ${
                      idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                    }`}
                  >
                    <td className="py-2.5 px-3.5 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {s.id}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-[10px] text-slate-400">{s.nameBn}</div>
                    </td>
                    <td className="py-2.5 px-2.5 text-center">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {s.studentClass}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-700">{s.rollNo}</td>

                    {/* 10 Interactive Day Cells */}
                    {sDays.map((status, dayIdx) => (
                      <td
                        key={dayIdx}
                        className="py-2 px-2 text-center border-l border-slate-100 cursor-pointer select-none"
                        onClick={() => toggleStatus(s.id, dayIdx)}
                      >
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-bold text-xs transition-all ${
                            status === 'P'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                    ))}

                    {/* Formulas */}
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-700 bg-emerald-50/40">
                      {presentCount}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-rose-700 bg-rose-50/40">
                      {absentCount}
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                            isBelowThreshold
                              ? 'bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isBelowThreshold && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                          {rate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-700">Conditional Formatting Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] border border-emerald-300">
                P
              </span>
              <span className="text-slate-600">Present (উপস্থিত)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-[10px] border border-rose-300">
                A
              </span>
              <span className="text-slate-600">Absent (অনুপস্থিত)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-300">
                &lt; 75%
              </span>
              <span className="text-rose-700 font-medium">Warning Alert (ওয়ার্নিং)</span>
            </div>
          </div>

          <div className="text-slate-500 font-mono text-[11px]">
            Formula: =COUNTIF(E6:N6, "P") &nbsp;|&nbsp; =O6/(O6+P6)
          </div>
        </div>
      </div>
    </div>
  );
};
