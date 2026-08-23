import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Phone,
  X,
  Check,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Staff } from '../types';

interface StaffPayrollViewProps {
  staffList: Staff[];
  onAddStaff: (staff: Staff) => void;
  onUpdateStaff: (staff: Staff) => void;
  onDeleteStaff: (id: string) => void;
}

export const StaffPayrollView: React.FC<StaffPayrollViewProps> = ({
  staffList,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const [formData, setFormData] = useState<Partial<Staff>>({
    id: `EMP-${staffList.length + 101}`,
    name: '',
    designation: 'Senior Teacher',
    contact: '8801',
    basicSalary: 18000,
    allowances: 2000,
    deductions: 0,
    netSalary: 20000,
    paymentDate: new Date().toISOString().split('T')[0],
    status: 'Paid',
  });

  const filteredStaff = staffList.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPayrollCost = filteredStaff.reduce((acc, s) => acc + s.netSalary, 0);
  const totalBasic = filteredStaff.reduce((acc, s) => acc + s.basicSalary, 0);
  const totalAllowances = filteredStaff.reduce((acc, s) => acc + s.allowances, 0);
  const totalDeductions = filteredStaff.reduce((acc, s) => acc + s.deductions, 0);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({
      id: `EMP-${staffList.length + 101}`,
      name: '',
      designation: 'Senior Teacher',
      contact: '88017',
      basicSalary: 18000,
      allowances: 2000,
      deductions: 0,
      netSalary: 20000,
      paymentDate: new Date().toISOString().split('T')[0],
      status: 'Paid',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (st: Staff) => {
    setEditingStaff(st);
    setFormData(st);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const basic = Number(formData.basicSalary) || 0;
    const allow = Number(formData.allowances) || 0;
    const ded = Number(formData.deductions) || 0;
    const net = Math.max(basic + allow - ded, 0);

    const staffToSave: Staff = {
      ...(formData as Staff),
      basicSalary: basic,
      allowances: allow,
      deductions: ded,
      netSalary: net,
    };

    if (editingStaff) {
      onUpdateStaff(staffToSave);
    } else {
      onAddStaff(staffToSave);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">💼 Teacher & Staff Payroll Register</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
              Sheet 8: শিক্ষক ও কর্মচারী বেতন
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            নিট স্যালারি হিসাব <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-bold">=Basic + Allowances - Deductions</code>
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন শিক্ষক/স্টাফ যোগ করুন (Add Staff)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="text-slate-500 font-medium">Total Staff Count</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{filteredStaff.length} Persons</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="text-slate-500 font-medium">Total Basic Salary</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">৳{totalBasic.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="text-slate-500 font-medium">Allowances & Incentives</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">৳{totalAllowances.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-200 bg-indigo-50/30">
          <div className="text-indigo-800 font-medium">Total Net Monthly Payroll</div>
          <div className="text-2xl font-bold text-indigo-900 mt-1">৳{totalPayrollCost.toLocaleString()}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff by name or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold whitespace-nowrap">
                <th className="py-3 px-3.5">Staff ID</th>
                <th className="py-3 px-3.5">Full Name</th>
                <th className="py-3 px-3">Designation</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3 text-right">Basic Salary</th>
                <th className="py-3 px-3 text-right">Allowances</th>
                <th className="py-3 px-3 text-right">Deductions</th>
                <th className="py-3 px-3.5 text-right bg-blue-950">Net Salary (৳)</th>
                <th className="py-3 px-3 text-center">Payment Date</th>
                <th className="py-3 px-2.5 text-center">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStaff.map((st, idx) => (
                <tr
                  key={st.id}
                  className={`hover:bg-blue-50/40 transition-colors ${
                    idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                  }`}
                >
                  <td className="py-2.5 px-3.5 font-mono font-bold text-blue-700 whitespace-nowrap">
                    {st.id}
                  </td>
                  <td className="py-2.5 px-3.5 font-bold text-slate-900">{st.name}</td>
                  <td className="py-2.5 px-3 text-slate-700">{st.designation}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{st.contact}</td>
                  <td className="py-2.5 px-3 text-right text-slate-700 font-mono">
                    ৳{st.basicSalary.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 font-mono">
                    +৳{st.allowances.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right text-rose-600 font-mono">
                    -৳{st.deductions.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-bold text-slate-900 bg-blue-50/30 font-mono">
                    ৳{st.netSalary.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-500">{st.paymentDate}</td>
                  <td className="py-2.5 px-2.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        st.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {st.status === 'Paid' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                      {st.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(st)}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                        title="Edit Staff"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete ${st.name}?`)) onDeleteStaff(st.id);
                        }}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                        title="Delete Staff"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <td colSpan={4} className="py-3 px-3 text-right">Total Payroll:</td>
                <td className="py-3 px-3 text-right">৳{totalBasic.toLocaleString()}</td>
                <td className="py-3 px-3 text-right text-emerald-700">+৳{totalAllowances.toLocaleString()}</td>
                <td className="py-3 px-3 text-right text-rose-700">-৳{totalDeductions.toLocaleString()}</td>
                <td className="py-3 px-3 text-right text-blue-900">৳{totalPayrollCost.toLocaleString()}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingStaff ? 'স্টাফ তথ্য এডিট করুন' : 'নতুন স্টাফ ও বেতন এন্ট্রি'}
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
                  <label className="block font-semibold text-slate-700 mb-1">Staff ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Basic (৳)</label>
                  <input
                    type="number"
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Allowances (৳)</label>
                  <input
                    type="number"
                    value={formData.allowances}
                    onChange={(e) => setFormData({ ...formData, allowances: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Deductions (৳)</label>
                  <input
                    type="number"
                    value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
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
                  <span>Save Staff Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
