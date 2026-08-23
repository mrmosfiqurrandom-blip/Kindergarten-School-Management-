import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Award,
  Printer,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  Edit2,
} from 'lucide-react';
import { AcademicResult, Student, SchoolInfo } from '../types';

interface AcademicResultsViewProps {
  results: AcademicResult[];
  students: Student[];
  schoolInfo: SchoolInfo;
  onAddResult: (result: AcademicResult) => void;
  onUpdateResult: (result: AcademicResult) => void;
}

export const AcademicResultsView: React.FC<AcademicResultsViewProps> = ({
  results,
  students,
  schoolInfo,
  onAddResult,
  onUpdateResult,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<AcademicResult | null>(null);
  const [reportCardStudent, setReportCardStudent] = useState<AcademicResult | null>(null);

  const [formData, setFormData] = useState<Partial<AcademicResult>>({
    id: `RES-${Date.now()}`,
    studentId: students[0]?.id || 'KS-101',
    studentName: students[0]?.name || '',
    studentClass: students[0]?.studentClass || 'Play',
    rollNo: students[0]?.rollNo || 1,
    term: '1st Term Evaluation',
    bangla: 85,
    english: 82,
    math: 90,
    gk: 88,
    science: 84,
    drawing: 92,
    remarks: 'Excellent Performance',
  });

  const filteredResults = results.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'All' || r.studentClass === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleStudentSelect = (sId: string) => {
    const s = students.find((st) => st.id === sId);
    if (s) {
      setFormData((prev) => ({
        ...prev,
        studentId: s.id,
        studentName: s.name,
        studentClass: s.studentClass,
        rollNo: s.rollNo,
      }));
    }
  };

  const handleOpenAdd = () => {
    setEditingResult(null);
    const s = students[0];
    setFormData({
      id: `RES-${Date.now()}`,
      studentId: s ? s.id : 'KS-101',
      studentName: s ? s.name : '',
      studentClass: s ? s.studentClass : 'Play',
      rollNo: s ? s.rollNo : 1,
      term: '1st Term Evaluation',
      bangla: 80,
      english: 80,
      math: 80,
      gk: 80,
      science: 80,
      drawing: 85,
      remarks: 'Satisfactory',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (res: AcademicResult) => {
    setEditingResult(res);
    setFormData(res);
    setIsModalOpen(true);
  };

  const calculateGrades = (b: number, e: number, m: number, g: number, s: number, d: number) => {
    const total = b + e + m + g + s + d;
    const avg = total / 6;
    let gpa = 0.0;
    let grade = 'F';
    let status = 'Fail';

    if (avg >= 80) {
      gpa = 5.0;
      grade = 'A+';
      status = 'Pass';
    } else if (avg >= 70) {
      gpa = 4.0;
      grade = 'A';
      status = 'Pass';
    } else if (avg >= 60) {
      gpa = 3.5;
      grade = 'A-';
      status = 'Pass';
    } else if (avg >= 50) {
      gpa = 3.0;
      grade = 'B';
      status = 'Pass';
    } else if (avg >= 40) {
      gpa = 2.0;
      grade = 'C';
      status = 'Pass';
    } else if (avg >= 33) {
      gpa = 1.0;
      grade = 'D';
      status = 'Pass';
    } else {
      gpa = 0.0;
      grade = 'F';
      status = 'Fail';
    }

    return { total, avg, gpa, grade, status };
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const b = Number(formData.bangla) || 0;
    const eng = Number(formData.english) || 0;
    const m = Number(formData.math) || 0;
    const gk = Number(formData.gk) || 0;
    const sci = Number(formData.science) || 0;
    const drw = Number(formData.drawing) || 0;

    const { total, avg, gpa, grade, status } = calculateGrades(b, eng, m, gk, sci, drw);

    const resultToSave: AcademicResult = {
      ...(formData as AcademicResult),
      bangla: b,
      english: eng,
      math: m,
      gk: gk,
      science: sci,
      drawing: drw,
      totalMarks: total,
      averageMarks: avg,
      gpa,
      grade,
      status: status as 'Pass' | 'Fail',
    };

    if (editingResult) {
      onUpdateResult(resultToSave);
    } else {
      onAddResult(resultToSave);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">🏆 Academic Marksheet & GPA Grade Calculator</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
              Sheet 10: পরীক্ষার ফলাফল ও প্রোগ্রেস
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            জিপিএ (৫.০০ স্কেল) ও লেটার গ্রেড অটোমেটিক এক্সেল নেস্টেড ইফ ফর্মুলা দ্বারা সমন্বিত
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>নম্বর এন্ট্রি (Enter Student Marks)</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search marksheet by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-800 cursor-pointer"
            >
              <option value="All">All Classes (সব)</option>
              {['Play', 'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold whitespace-nowrap">
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3.5">Student Name</th>
                <th className="py-3 px-2 text-center">Class</th>
                <th className="py-3 px-2 text-center">Roll</th>
                <th className="py-3 px-2.5 text-center">Bangla</th>
                <th className="py-3 px-2.5 text-center">English</th>
                <th className="py-3 px-2.5 text-center">Math</th>
                <th className="py-3 px-2.5 text-center">GK</th>
                <th className="py-3 px-2.5 text-center">Science</th>
                <th className="py-3 px-2.5 text-center">Drawing</th>
                <th className="py-3 px-3 text-center bg-blue-950">Total</th>
                <th className="py-3 px-3 text-center bg-blue-950">GPA (5.00)</th>
                <th className="py-3 px-2.5 text-center bg-indigo-950">Grade</th>
                <th className="py-3 px-3 text-center">Report Card</th>
                <th className="py-3 px-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredResults.map((res, idx) => (
                <tr
                  key={res.id}
                  className={`hover:bg-blue-50/40 transition-colors ${
                    idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                    {res.studentId}
                  </td>
                  <td className="py-2.5 px-3.5 font-bold text-slate-900">{res.studentName}</td>
                  <td className="py-2.5 px-2 text-center">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      {res.studentClass}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center font-bold text-slate-800">{res.rollNo}</td>
                  <td className="py-2.5 px-2.5 text-center">{res.bangla}</td>
                  <td className="py-2.5 px-2.5 text-center">{res.english}</td>
                  <td className="py-2.5 px-2.5 text-center font-bold text-slate-900">{res.math}</td>
                  <td className="py-2.5 px-2.5 text-center">{res.gk}</td>
                  <td className="py-2.5 px-2.5 text-center">{res.science}</td>
                  <td className="py-2.5 px-2.5 text-center">{res.drawing}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-900 bg-blue-50/30">
                    {res.totalMarks}
                    <span className="text-[10px] text-slate-400 block font-normal">({res.averageMarks.toFixed(1)}%)</span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-blue-800 bg-blue-50/30 font-mono text-sm">
                    {res.gpa.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-2.5 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full font-bold text-xs ${
                        res.grade === 'A+'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : res.grade === 'A' || res.grade === 'A-'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : res.grade === 'F'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {res.grade}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => setReportCardStudent(res)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-semibold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Report Card</span>
                    </button>
                  </td>
                  <td className="py-2.5 px-2.5 text-center">
                    <button
                      onClick={() => handleOpenEdit(res)}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Report Card Modal */}
      {reportCardStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-300 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <h3 className="font-bold text-slate-900 text-base">Academic Progress Report Card</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report Card</span>
                </button>
                <button
                  onClick={() => setReportCardStudent(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Actual Card */}
            <div className="mt-4 border-2 border-slate-900 rounded-xl p-6 text-slate-900">
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <h2 className="text-xl font-black uppercase">{schoolInfo.name}</h2>
                <p className="text-xs font-semibold text-slate-600">{schoolInfo.nameBn}</p>
                <div className="inline-block mt-2 px-3 py-1 bg-slate-900 text-white font-bold text-xs rounded-md uppercase">
                  Student Academic Progress Report ({reportCardStudent.term})
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg my-4 text-xs border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px]">Student ID</span>
                  <span className="font-bold font-mono">{reportCardStudent.studentId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Student Name</span>
                  <span className="font-bold">{reportCardStudent.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Class & Roll</span>
                  <span className="font-bold">
                    {reportCardStudent.studentClass} (Roll #{reportCardStudent.rollNo})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Final Status</span>
                  <span className="font-bold text-emerald-700">{reportCardStudent.status}</span>
                </div>
              </div>

              <table className="w-full text-xs text-left border border-slate-300 my-4">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="py-2 px-3 border-r border-slate-800">Subject Name</th>
                    <th className="py-2 px-3 text-center border-r border-slate-800">Max Marks</th>
                    <th className="py-2 px-3 text-center border-r border-slate-800">Obtained Marks</th>
                    <th className="py-2 px-3 text-center">Letter Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {[
                    { sub: 'Bangla (বাংলা)', max: 100, obt: reportCardStudent.bangla },
                    { sub: 'English (ইংরেজি)', max: 100, obt: reportCardStudent.english },
                    { sub: 'Mathematics (গণিত)', max: 100, obt: reportCardStudent.math },
                    { sub: 'General Knowledge (সাধারণ জ্ঞান)', max: 100, obt: reportCardStudent.gk },
                    { sub: 'Elementary Science (বিজ্ঞান)', max: 100, obt: reportCardStudent.science },
                    { sub: 'Art & Drawing (অঙ্কন)', max: 100, obt: reportCardStudent.drawing },
                  ].map((row) => (
                    <tr key={row.sub}>
                      <td className="py-2 px-3 border-r border-slate-200 font-medium">{row.sub}</td>
                      <td className="py-2 px-3 text-center border-r border-slate-200">{row.max}</td>
                      <td className="py-2 px-3 text-center font-bold font-mono border-r border-slate-200">{row.obt}</td>
                      <td className="py-2 px-3 text-center font-bold">{row.obt >= 80 ? 'A+' : row.obt >= 70 ? 'A' : 'A-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                    <td className="py-2.5 px-3 border-r border-slate-300">Total (সর্বমোট):</td>
                    <td className="py-2.5 px-3 text-center border-r border-slate-300">600</td>
                    <td className="py-2.5 px-3 text-center border-r border-slate-300 font-mono text-sm">{reportCardStudent.totalMarks}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-sm text-blue-800">
                      GPA: {reportCardStudent.gpa.toFixed(2)} ({reportCardStudent.grade})
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-200 text-xs my-3">
                <span className="font-bold text-slate-800">Class Teacher Remarks: </span>
                <span className="text-slate-700 italic">"{reportCardStudent.remarks}"</span>
              </div>

              <div className="flex justify-between items-end pt-8 mt-6 border-t border-dashed border-slate-300 text-xs">
                <div className="text-center">
                  <div className="w-32 border-b border-slate-700 mb-1" />
                  <span className="font-semibold text-slate-700">Class Teacher</span>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-700 mb-1" />
                  <span className="font-semibold text-slate-700">Principal Signature</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Marks Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingResult ? 'নম্বর এডিট করুন' : 'নতুন রেজাল্ট এন্ট্রি'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Student *</label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => handleStudentSelect(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id} - {s.name} ({s.studentClass})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Term</label>
                  <input
                    type="text"
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 mb-2">Subject Marks (Max 100 per subject)</div>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Bangla</label>
                    <input
                      type="number"
                      max={100}
                      value={formData.bangla}
                      onChange={(e) => setFormData({ ...formData, bangla: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">English</label>
                    <input
                      type="number"
                      max={100}
                      value={formData.english}
                      onChange={(e) => setFormData({ ...formData, english: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Math</label>
                    <input
                      type="number"
                      max={100}
                      value={formData.math}
                      onChange={(e) => setFormData({ ...formData, math: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">GK</label>
                    <input
                      type="number"
                      max={100}
                      value={formData.gk}
                      onChange={(e) => setFormData({ ...formData, gk: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Science</label>
                    <input
                      type="number"
                      max={100}
                      value={formData.science}
                      onChange={(e) => setFormData({ ...formData, science: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Drawing</label>
                    <input
                      type="number"
                      max={100}
                      value={formData.drawing}
                      onChange={(e) => setFormData({ ...formData, drawing: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks</label>
                <input
                  type="text"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  placeholder="e.g. Outstanding effort, keep it up!"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Result</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
