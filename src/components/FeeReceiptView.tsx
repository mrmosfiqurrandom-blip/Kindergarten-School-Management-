import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Printer,
  Sparkles,
  CheckCircle2,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { Student, FeeRecord, SchoolInfo } from '../types';

interface FeeReceiptViewProps {
  students: Student[];
  fees: FeeRecord[];
  schoolInfo: SchoolInfo;
  selectedStudentId?: string;
  selectedMonth?: string;
}

export const FeeReceiptView: React.FC<FeeReceiptViewProps> = ({
  students,
  fees,
  schoolInfo,
  selectedStudentId: initialStudentId,
  selectedMonth: initialMonth,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || (students[0]?.id || 'KS-101')
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    initialMonth || 'January 2025'
  );

  useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
    }
  }, [initialStudentId]);

  useEffect(() => {
    if (initialMonth) {
      setSelectedMonth(initialMonth);
    }
  }, [initialMonth]);

  const student = students.find((s) => s.id === selectedStudentId) || students[0];
  const feeRecord =
    fees.find((f) => f.studentId === selectedStudentId && f.month === selectedMonth) ||
    fees.find((f) => f.studentId === selectedStudentId) ||
    fees[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Control Bar (Hidden on Print) */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">🧾 Student Fee Receipt & Invoice (Voucher)</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
              Sheet 6: মানি রিসিট
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            প্রিন্ট ও ভাউচার রেডি ডাবল কপি মানি রিসিট (অফিস কপি ও অভিভাবক কপি)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-700">Student:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-300 font-mono font-bold text-slate-900 cursor-pointer"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} - {s.name} ({s.studentClass})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-700">Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 cursor-pointer"
            >
              {['January 2025', 'February 2025', 'March 2025', 'April 2025'].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice (A4 / A5)</span>
          </button>
        </div>
      </div>

      {/* Printable Receipt Container (A4 layout with Guardian Copy & School Copy) */}
      <div className="bg-white rounded-2xl p-8 shadow-md border border-slate-300 max-w-4xl mx-auto print:p-0 print:border-none print:shadow-none">
        {/* Receipt Header */}
        <div className="border-2 border-slate-900 rounded-xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center text-2xl font-black">
                ☀️
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                  {schoolInfo.name}
                </h1>
                <p className="text-xs font-semibold text-slate-700">{schoolInfo.nameBn}</p>
                <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                  <span>📍 {schoolInfo.address}</span>
                  <span>📞 {schoolInfo.phone}</span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-xs rounded-md uppercase tracking-wider mb-1">
                Money Receipt / ফি রসিদ
              </div>
              <div className="font-mono text-xs text-slate-700">
                <span className="font-semibold">Receipt No: </span>
                <span className="font-bold text-blue-800">{feeRecord?.receiptNo || 'REC-2025-001'}</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Date: {feeRecord?.paymentDate || new Date().toISOString().split('T')[0]}
              </div>
            </div>
          </div>

          {/* Student Dossier Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg my-4 text-xs border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[10px]">Student ID</span>
              <span className="font-mono font-bold text-slate-900">{student?.id}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Student Name</span>
              <span className="font-bold text-slate-900">{student?.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Class & Roll</span>
              <span className="font-bold text-slate-900">
                {student?.studentClass} (Roll #{student?.rollNo})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Billing Month</span>
              <span className="font-bold text-blue-700">{feeRecord?.month || selectedMonth}</span>
            </div>
          </div>

          {/* Fee Itemization Table */}
          <div className="overflow-x-auto my-4">
            <table className="w-full text-xs text-left border border-slate-300">
              <thead>
                <tr className="bg-slate-900 text-white font-bold">
                  <th className="py-2 px-3 border-r border-slate-800 w-12 text-center">SL</th>
                  <th className="py-2 px-3 border-r border-slate-800">Fee Particulars / বিবরণ</th>
                  <th className="py-2 px-4 text-right w-36">Amount (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                <tr>
                  <td className="py-2 px-3 text-center border-r border-slate-200">01</td>
                  <td className="py-2 px-3 border-r border-slate-200">Monthly Tuition Fee (মাসিক বেতন)</td>
                  <td className="py-2 px-4 text-right font-mono">৳{(feeRecord?.monthlyTuitionFee || 0).toLocaleString()}</td>
                </tr>
                {feeRecord?.admissionFee ? (
                  <tr>
                    <td className="py-2 px-3 text-center border-r border-slate-200">02</td>
                    <td className="py-2 px-3 border-r border-slate-200">Admission / Session Fee (ভর্তি ফি)</td>
                    <td className="py-2 px-4 text-right font-mono">৳{feeRecord.admissionFee.toLocaleString()}</td>
                  </tr>
                ) : null}
                {feeRecord?.examFee ? (
                  <tr>
                    <td className="py-2 px-3 text-center border-r border-slate-200">03</td>
                    <td className="py-2 px-3 border-r border-slate-200">Examination & Material Fee (পরীক্ষার ফি)</td>
                    <td className="py-2 px-4 text-right font-mono">৳{feeRecord.examFee.toLocaleString()}</td>
                  </tr>
                ) : null}
                {feeRecord?.transportFee ? (
                  <tr>
                    <td className="py-2 px-3 text-center border-r border-slate-200">04</td>
                    <td className="py-2 px-3 border-r border-slate-200">School Van / Transport (যাতায়াত)</td>
                    <td className="py-2 px-4 text-right font-mono">৳{feeRecord.transportFee.toLocaleString()}</td>
                  </tr>
                ) : null}
                {feeRecord?.fineFee ? (
                  <tr>
                    <td className="py-2 px-3 text-center border-r border-slate-200">05</td>
                    <td className="py-2 px-3 border-r border-slate-200">Late Fine / অন্যান্য</td>
                    <td className="py-2 px-4 text-right font-mono">৳{feeRecord.fineFee.toLocaleString()}</td>
                  </tr>
                ) : null}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <td colSpan={2} className="py-2 px-3 text-right border-r border-slate-300">
                    Total Payable Amount (সর্বমোট দাবি):
                  </td>
                  <td className="py-2 px-4 text-right font-mono text-slate-900">
                    ৳{(feeRecord?.totalPayable || 0).toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-emerald-50 text-emerald-900 font-bold border-t border-slate-300">
                  <td colSpan={2} className="py-2 px-3 text-right border-r border-slate-300">
                    Total Amount Received (পরিশোধিত টাকা):
                  </td>
                  <td className="py-2 px-4 text-right font-mono text-emerald-800">
                    ৳{(feeRecord?.amountPaid || 0).toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-amber-50 text-amber-900 font-bold border-t border-slate-300">
                  <td colSpan={2} className="py-2 px-3 text-right border-r border-slate-300">
                    Current Balance Due (বর্তমান বকেয়া):
                  </td>
                  <td className="py-2 px-4 text-right font-mono text-amber-800">
                    ৳{(feeRecord?.dueAmount || 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Details & Signatures */}
          <div className="flex flex-wrap items-end justify-between gap-6 pt-6 border-t border-dashed border-slate-300 text-xs">
            <div className="space-y-1">
              <div className="text-slate-600">
                <span className="font-semibold">Payment Mode:</span>{' '}
                <span className="font-bold text-slate-800">{feeRecord?.paymentMethod || 'Cash'}</span>
              </div>
              <div className="text-slate-600">
                <span className="font-semibold">Payment Status:</span>{' '}
                <span className="font-bold text-emerald-700">{feeRecord?.paymentStatus}</span>
              </div>
              <div className="text-[10px] text-slate-400 italic">
                * কম্পিউটারে প্রস্তুতকৃত রসিদ, কোনো সিল বা স্বাক্ষরের তারতম্য থাকলে অবিলম্বে যোগাযোগ করুন।
              </div>
            </div>

            <div className="flex gap-12 text-center">
              <div>
                <div className="w-32 border-b border-slate-700 mb-1" />
                <span className="text-[10px] font-semibold text-slate-700">Accountant / আদায়কারী</span>
              </div>
              <div>
                <div className="w-32 border-b border-slate-700 mb-1" />
                <span className="text-[10px] font-semibold text-slate-700">Principal Signature</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
