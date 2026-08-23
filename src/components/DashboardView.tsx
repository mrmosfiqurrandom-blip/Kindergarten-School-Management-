import React from 'react';
import {
  Users,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Scale,
  AlertCircle,
  CheckCircle2,
  Receipt,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  FileSpreadsheet,
  Zap,
} from 'lucide-react';
import { Student, Staff, FeeRecord, Expense, AcademicResult } from '../types';
import { ActiveTab } from './Navigation';

interface DashboardViewProps {
  students: Student[];
  staffList: Staff[];
  fees: FeeRecord[];
  expenses: Expense[];
  results: AcademicResult[];
  onNavigate: (tab: ActiveTab) => void;
  onExportExcel: () => void;
  onOpenGoogleSheetsSync?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  staffList,
  fees,
  expenses,
  results,
  onNavigate,
  onExportExcel,
  onOpenGoogleSheetsSync,
}) => {
  const totalStudents = students.length;
  const totalStaff = staffList.length;

  const totalFeeCollected = fees.reduce((acc, f) => acc + f.amountPaid, 0);
  const totalDueAmount = fees.reduce((acc, f) => acc + f.dueAmount, 0);
  const totalBilledFee = fees.reduce((acc, f) => acc + f.totalPayable, 0);

  const totalPayroll = staffList.reduce((acc, s) => acc + s.netSalary, 0);
  const totalOpExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalExpenses = totalPayroll + totalOpExpenses;

  const netSurplus = totalFeeCollected - totalExpenses;

  // Class breakdown
  const classesList = ['Play', 'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
  const classBreakdown = classesList.map((cls) => {
    const clsStudents = students.filter((s) => s.studentClass === cls);
    const clsFees = fees.filter((f) => f.studentClass === cls);
    const totalPayable = clsFees.reduce((acc, f) => acc + f.totalPayable, 0);
    const collected = clsFees.reduce((acc, f) => acc + f.amountPaid, 0);
    const due = clsFees.reduce((acc, f) => acc + f.dueAmount, 0);
    return {
      name: cls,
      studentCount: clsStudents.length,
      totalPayable,
      collected,
      due,
    };
  });

  const dueStudentsCount = fees.filter((f) => f.dueAmount > 0).length;
  const passedStudentsCount = results.filter((r) => r.status === 'Pass').length;
  const passRate = results.length > 0 ? Math.round((passedStudentsCount / results.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-blue-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5" /> Sheet 1: ড্যাশবোর্ড ও কেপিআই (KPIs)
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Executive Kindergarten Dashboard</h2>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              রিয়েল-টাইম একাডেমিক, শিক্ষার্থী তথ্য, ফি কালেকশন, স্টাফ পেরোল ও ক্যাশফ্লো এনালাইটিক্স। স্বয়ংক্রিয় এক্সেল ফর্মুলা দ্বারা সমন্বিত।
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {onOpenGoogleSheetsSync && (
              <button
                onClick={onOpenGoogleSheetsSync}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Google Sheets Sync</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('receipt')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>Generate Fee Receipt</span>
            </button>

            <button
              onClick={() => onNavigate('due_alerts')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Dues ({dueStudentsCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Students */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>মোট শিক্ষার্থী</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{totalStudents}</div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Active: {students.filter(s => s.status === 'Active').length}</span>
            <span className="font-mono text-[10px] bg-slate-100 px-1 rounded text-slate-600">=COUNTA()</span>
          </div>
        </div>

        {/* Total Staff */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>মোট শিক্ষক ও স্টাফ</span>
            <Briefcase className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{totalStaff}</div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Teachers: 4 | Admin: 2</span>
            <span className="font-mono text-[10px] bg-slate-100 px-1 rounded text-slate-600">=COUNTA()</span>
          </div>
        </div>

        {/* Total Collected */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-200 bg-emerald-50/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-medium">
            <span>মোট সংগৃহীত ফি</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">৳{totalFeeCollected.toLocaleString()}</div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-emerald-700">
            <span>Payable: ৳{totalBilledFee.toLocaleString()}</span>
            <span className="font-mono text-[10px] bg-emerald-100/80 px-1 rounded text-emerald-800">=SUM(K:K)</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-rose-200 bg-rose-50/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-rose-800 text-xs font-medium">
            <span>মোট ব্যয় (বেতন + খরচ)</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-700">৳{totalExpenses.toLocaleString()}</div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-rose-700">
            <span>Payroll: ৳{totalPayroll.toLocaleString()}</span>
            <span className="font-mono text-[10px] bg-rose-100/80 px-1 rounded text-rose-800">=SUM(Payroll)+Exp</span>
          </div>
        </div>

        {/* Net Surplus / Balance */}
        <div className={`bg-white rounded-xl p-4 shadow-sm border ${netSurplus >= 0 ? 'border-blue-200 bg-blue-50/30' : 'border-red-200 bg-red-50/30'} hover:shadow-md transition-shadow`}>
          <div className="flex items-center justify-between text-slate-700 text-xs font-medium">
            <span>নিট উদ্বৃত্ত / লাভ</span>
            <Scale className="w-4 h-4 text-blue-600" />
          </div>
          <div className={`mt-2 text-2xl font-bold ${netSurplus >= 0 ? 'text-blue-800' : 'text-rose-700'}`}>
            ৳{netSurplus.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>{netSurplus >= 0 ? 'Surplus Balance' : 'Deficit'}</span>
            <span className="font-mono text-[10px] bg-slate-100 px-1 rounded text-slate-600">=Income-Expense</span>
          </div>
        </div>

        {/* Total Dues */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-200 bg-amber-50/40 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-amber-900 text-xs font-medium">
            <span>মোট বকেয়া ফি</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700">৳{totalDueAmount.toLocaleString()}</div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-amber-800">
            <span>{dueStudentsCount} Students Due</span>
            <span className="font-mono text-[10px] bg-amber-100 px-1 rounded text-amber-800">=SUM(L:L)</span>
          </div>
        </div>
      </div>

      {/* Class-wise Summary Table & Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>🏫 ক্লাস অনুযায়ী শিক্ষার্থী ও ফি পরিসংখ্যান</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Class-wise student count, billing, collection, and due breakdown
              </p>
            </div>
            <button
              onClick={() => onNavigate('fees')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View Fee Ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-900 text-white font-semibold">
                  <th className="py-2.5 px-3 rounded-l-lg">Class Name</th>
                  <th className="py-2.5 px-3 text-center">Students</th>
                  <th className="py-2.5 px-3 text-right">Total Payable</th>
                  <th className="py-2.5 px-3 text-right">Collected</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg">Due Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {classBreakdown.map((c, i) => {
                  const collectionRate = c.totalPayable > 0 ? Math.round((c.collected / c.totalPayable) * 100) : 100;
                  return (
                    <tr key={c.name} className={i % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{c.name}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-700">
                          {c.studentCount}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600">৳{c.totalPayable.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-600 font-semibold">
                        ৳{c.collected.toLocaleString()}
                        <span className="text-[10px] text-slate-400 ml-1">({collectionRate}%)</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold">
                        {c.due > 0 ? (
                          <span className="text-amber-600">৳{c.due.toLocaleString()}</span>
                        ) : (
                          <span className="text-emerald-600 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> ৳0
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                  <td className="py-2.5 px-3 rounded-l-lg">Total / সর্বমোট</td>
                  <td className="py-2.5 px-3 text-center">{totalStudents}</td>
                  <td className="py-2.5 px-3 text-right">৳{totalBilledFee.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-700">৳{totalFeeCollected.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-amber-700 rounded-r-lg">৳{totalDueAmount.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Quick Action & Financial Health Panel */}
        <div className="space-y-4">
          {/* Collection Health Widget */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm mb-3">📈 Cash Flow & Collection Rate</h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Fee Recovery Rate</span>
                  <span className="text-emerald-600">
                    {totalBilledFee > 0 ? Math.round((totalFeeCollected / totalBilledFee) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all"
                    style={{ width: `${totalBilledFee > 0 ? (totalFeeCollected / totalBilledFee) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Exam Pass Rate</span>
                  <span className="text-blue-600">{passRate}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all"
                    style={{ width: `${passRate}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="text-slate-500 text-[11px]">Monthly Payroll</div>
                  <div className="font-bold text-slate-800 mt-0.5">৳{totalPayroll.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="text-slate-500 text-[11px]">Campus Expenses</div>
                  <div className="font-bold text-slate-800 mt-0.5">৳{totalOpExpenses.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Excel Automation Notice */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-sm border border-indigo-800/40">
            <h4 className="font-bold text-sm flex items-center gap-2 text-indigo-200">
              <span>⚡ Full 10-Sheet Workbook Ready</span>
            </h4>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              ড্যাশবোর্ড, উপস্থিতি, রসিদ ভাউচার, বকেয়া হোয়াটসঅ্যাপ লিংক ও মার্কশিট সহ ফুললি অটোমেটেড এক্সেল ফাইল যেকোনো সময় এক্সপোর্ট করুন।
            </p>
            <button
              onClick={onExportExcel}
              className="mt-3 w-full py-2 px-3 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Download Live Excel File</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
