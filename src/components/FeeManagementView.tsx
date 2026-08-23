import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  Plus,
  Receipt,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  XCircle,
  X,
  Check,
} from 'lucide-react';
import { FeeRecord, Student, StudentClass, PaymentStatus } from '../types';

interface FeeManagementViewProps {
  fees: FeeRecord[];
  students: Student[];
  onAddFeeRecord: (record: FeeRecord) => void;
  onUpdateFeeRecord: (record: FeeRecord) => void;
  onGenerateReceipt: (studentId: string, month: string) => void;
  onSendWhatsApp: (studentId: string) => void;
}

export const FeeManagementView: React.FC<FeeManagementViewProps> = ({
  fees,
  students,
  onAddFeeRecord,
  onUpdateFeeRecord,
  onGenerateReceipt,
  onSendWhatsApp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FeeRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<FeeRecord>>({
    id: `FEE-${Date.now()}`,
    studentId: students[0]?.id || 'KS-101',
    studentName: students[0]?.name || '',
    studentClass: students[0]?.studentClass || 'Play',
    month: 'January 2025',
    admissionFee: 0,
    monthlyTuitionFee: 2500,
    examFee: 0,
    transportFee: 0,
    fineFee: 0,
    totalPayable: 2500,
    amountPaid: 2500,
    dueAmount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'Paid',
    receiptNo: `REC-2025-${Math.floor(100 + Math.random() * 900)}`,
    paymentMethod: 'bKash',
  });

  const months = ['January 2025', 'February 2025', 'March 2025', 'April 2025'];

  const filteredFees = fees.filter((f) => {
    const matchesSearch =
      f.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.receiptNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'All' || f.studentClass === selectedClass;
    const matchesStatus = selectedStatus === 'All' || f.paymentStatus === selectedStatus;
    const matchesMonth = selectedMonth === 'All' || f.month === selectedMonth;

    return matchesSearch && matchesClass && matchesStatus && matchesMonth;
  });

  const totalPayableSum = filteredFees.reduce((acc, f) => acc + f.totalPayable, 0);
  const totalPaidSum = filteredFees.reduce((acc, f) => acc + f.amountPaid, 0);
  const totalDueSum = filteredFees.reduce((acc, f) => acc + f.dueAmount, 0);

  const handleStudentSelectInForm = (sId: string) => {
    const s = students.find((st) => st.id === sId);
    if (s) {
      setFormData((prev) => ({
        ...prev,
        studentId: s.id,
        studentName: s.name,
        studentClass: s.studentClass,
      }));
    }
  };

  const handleOpenAdd = () => {
    setEditingRecord(null);
    const s = students[0];
    setFormData({
      id: `FEE-${Date.now()}`,
      studentId: s ? s.id : 'KS-101',
      studentName: s ? s.name : '',
      studentClass: s ? s.studentClass : 'Play',
      month: 'January 2025',
      admissionFee: 0,
      monthlyTuitionFee: 2800,
      examFee: 0,
      transportFee: 0,
      fineFee: 0,
      totalPayable: 2800,
      amountPaid: 2800,
      dueAmount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentStatus: 'Paid',
      receiptNo: `REC-2025-${Math.floor(100 + Math.random() * 900)}`,
      paymentMethod: 'Cash',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: FeeRecord) => {
    setEditingRecord(rec);
    setFormData(rec);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adm = Number(formData.admissionFee) || 0;
    const tui = Number(formData.monthlyTuitionFee) || 0;
    const exm = Number(formData.examFee) || 0;
    const tra = Number(formData.transportFee) || 0;
    const fin = Number(formData.fineFee) || 0;
    const total = adm + tui + exm + tra + fin;
    const paid = Number(formData.amountPaid) || 0;
    const due = Math.max(total - paid, 0);

    let status: PaymentStatus = 'Paid';
    if (due === total) status = 'Unpaid';
    else if (due > 0) status = 'Partial';

    const recordToSave: FeeRecord = {
      ...(formData as FeeRecord),
      admissionFee: adm,
      monthlyTuitionFee: tui,
      examFee: exm,
      transportFee: tra,
      fineFee: fin,
      totalPayable: total,
      amountPaid: paid,
      dueAmount: due,
      paymentStatus: status,
    };

    if (editingRecord) {
      onUpdateFeeRecord(recordToSave);
    } else {
      onAddFeeRecord(recordToSave);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">💳 Tuition & Fee Collection Ledger</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
              Sheet 5: ফি ব্যবস্থাপনা
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            টোটাল পেয়াবল <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-bold">=SUM(E:I)</code> এবং বকেয়া ফি <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-rose-700 font-bold">=J-K</code> অটোমেটিক হিসাব
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>ফি এন্ট্রি / কালেকশন (Record Fee)</span>
        </button>
      </div>

      {/* Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Filtered Total Payable (মোট দাবি)</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">৳{totalPayableSum.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-200 bg-emerald-50/30">
          <div className="text-xs text-emerald-800 font-medium">Filtered Total Collected (সংগৃহীত)</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">৳{totalPaidSum.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-200 bg-amber-50/40">
          <div className="text-xs text-amber-800 font-medium">Filtered Total Due (মোট বকেয়া)</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">৳{totalDueSum.toLocaleString()}</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, ID or receipt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-800 cursor-pointer"
          >
            <option value="All">All Months (সকল মাস)</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-800 cursor-pointer"
          >
            <option value="All">All Classes (সব)</option>
            {['Play', 'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-800 cursor-pointer"
          >
            <option value="All">All Status (সব)</option>
            <option value="Paid">Paid Only</option>
            <option value="Partial">Partial Due</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold whitespace-nowrap">
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-2.5 text-center">Class</th>
                <th className="py-3 px-2.5">Month</th>
                <th className="py-3 px-2.5 text-right">Tuition</th>
                <th className="py-3 px-2.5 text-right">Exam/Trans</th>
                <th className="py-3 px-3 text-right bg-blue-950">Total Payable</th>
                <th className="py-3 px-3 text-right bg-emerald-950">Amount Paid</th>
                <th className="py-3 px-3 text-right bg-amber-950">Due Balance</th>
                <th className="py-3 px-2.5 text-center">Status</th>
                <th className="py-3 px-3 text-center">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredFees.map((f, idx) => (
                <tr
                  key={f.id}
                  className={`hover:bg-blue-50/40 transition-colors ${
                    idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                    {f.studentId}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900">{f.studentName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{f.receiptNo}</div>
                  </td>
                  <td className="py-2.5 px-2.5 text-center">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      {f.studentClass}
                    </span>
                  </td>
                  <td className="py-2.5 px-2.5 text-slate-700 whitespace-nowrap">{f.month}</td>
                  <td className="py-2.5 px-2.5 text-right text-slate-700">৳{f.monthlyTuitionFee.toLocaleString()}</td>
                  <td className="py-2.5 px-2.5 text-right text-slate-500">
                    ৳{(f.examFee + f.transportFee + f.fineFee).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 bg-blue-50/30">
                    ৳{f.totalPayable.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-700 bg-emerald-50/30">
                    ৳{f.amountPaid.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-amber-700 bg-amber-50/30">
                    ৳{f.dueAmount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-2.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        f.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : f.paymentStatus === 'Partial'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {f.paymentStatus === 'Paid' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {f.paymentStatus === 'Partial' && <AlertCircle className="w-3 h-3 text-amber-600" />}
                      {f.paymentStatus === 'Unpaid' && <XCircle className="w-3 h-3 text-rose-600" />}
                      {f.paymentStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onGenerateReceipt(f.studentId, f.month)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                        title="Print Fee Receipt"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                      </button>
                      {f.dueAmount > 0 && (
                        <button
                          onClick={() => onSendWhatsApp(f.studentId)}
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white transition-colors cursor-pointer"
                          title="Send WhatsApp Due Notice"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEdit(f)}
                        className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white text-[10px] font-semibold cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <td colSpan={6} className="py-3 px-3 text-right">Total Summary:</td>
                <td className="py-3 px-3 text-right">৳{totalPayableSum.toLocaleString()}</td>
                <td className="py-3 px-3 text-right text-emerald-700">৳{totalPaidSum.toLocaleString()}</td>
                <td className="py-3 px-3 text-right text-amber-700">৳{totalDueSum.toLocaleString()}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Fee Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingRecord ? 'ফি রেকর্ড এডিট করুন (Edit Fee)' : 'নতুন ফি কালেকশন এন্ট্রি (Record Fee)'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Student *</label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => handleStudentSelectInForm(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-slate-800"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id} - {s.name} ({s.studentClass})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Billing Month *</label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                  >
                    {months.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800 text-xs">Fee Item Breakdown (টাকার পরিমাণ ৳)</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Tuition Fee</label>
                    <input
                      type="number"
                      value={formData.monthlyTuitionFee}
                      onChange={(e) => setFormData({ ...formData, monthlyTuitionFee: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Admission Fee</label>
                    <input
                      type="number"
                      value={formData.admissionFee}
                      onChange={(e) => setFormData({ ...formData, admissionFee: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Exam Fee</label>
                    <input
                      type="number"
                      value={formData.examFee}
                      onChange={(e) => setFormData({ ...formData, examFee: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Transport Fee</label>
                    <input
                      type="number"
                      value={formData.transportFee}
                      onChange={(e) => setFormData({ ...formData, transportFee: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Late Fine</label>
                    <input
                      type="number"
                      value={formData.fineFee}
                      onChange={(e) => setFormData({ ...formData, fineFee: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-emerald-800 mb-1">Amount Paid (পরিশোধিত টাকা) *</label>
                  <input
                    type="number"
                    required
                    value={formData.amountPaid}
                    onChange={(e) => setFormData({ ...formData, amountPaid: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border-2 border-emerald-500 font-mono font-bold text-base text-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    <option value="Cash">Cash (নগদ)</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Bank">Bank Deposit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Receipt No</label>
                  <input
                    type="text"
                    value={formData.receiptNo}
                    onChange={(e) => setFormData({ ...formData, receiptNo: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
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
                  <span>Save Collection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
