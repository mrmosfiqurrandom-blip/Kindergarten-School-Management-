import React, { useState } from 'react';
import {
  TrendingDown,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  X,
  Check,
  DollarSign,
} from 'lucide-react';
import { Expense, ExpenseCategory } from '../types';

interface ExpenseTrackerViewProps {
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onUpdateExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpenseTrackerView: React.FC<ExpenseTrackerViewProps> = ({
  expenses,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [formData, setFormData] = useState<Partial<Expense>>({
    id: `EXP-${expenses.length + 101}`,
    date: new Date().toISOString().split('T')[0],
    category: 'Stationeries',
    description: '',
    amount: 1500,
    approvedBy: 'Principal',
  });

  const categories: ExpenseCategory[] = [
    'Rent',
    'Electricity & Utility',
    'Stationeries',
    'Refreshments',
    'Campus Maintenance',
    'Marketing & Promotion',
    'Events & Sports',
    'Others',
  ];

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.approvedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpenseSum = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  // Category breakdown
  const categoryStats = categories.map((cat) => {
    const items = expenses.filter((e) => e.category === cat);
    const sum = items.reduce((acc, e) => acc + e.amount, 0);
    return { category: cat, sum, count: items.length };
  });

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormData({
      id: `EXP-${expenses.length + 101}`,
      date: new Date().toISOString().split('T')[0],
      category: 'Stationeries',
      description: '',
      amount: 1200,
      approvedBy: 'Principal',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setFormData(exp);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(formData.amount) || 0;
    const expToSave: Expense = {
      ...(formData as Expense),
      amount: amt,
    };
    if (editingExpense) {
      onUpdateExpense(expToSave);
    } else {
      onAddExpense(expToSave);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">📉 Operational Expense Register & Tracker</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">
              Sheet 9: স্কুলের খরচ খাতা
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            স্কুল ক্যাম্পাস ভাড়া, বিদ্যুৎ বিল, স্টেশনারি ও মেইনটেন্যান্স খরচের ভাউচার ডাটাবেজ
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন খরচের হিসাব যোগ করুন (Add Expense)</span>
        </button>
      </div>

      {/* Category Pills Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categoryStats.slice(0, 4).map((c) => (
          <div key={c.category} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] text-slate-500 font-medium truncate">{c.category}</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">৳{c.sum.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400">{c.count} Vouchers</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expenses by description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-800 cursor-pointer"
            >
              <option value="All">All Categories (সব ক্যাটাগরি)</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold whitespace-nowrap">
                <th className="py-3 px-3.5">Expense ID</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3.5">Description / বিবরণ</th>
                <th className="py-3 px-3.5 text-right bg-rose-950">Amount (৳)</th>
                <th className="py-3 px-3">Approved By</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredExpenses.map((exp, idx) => (
                <tr
                  key={exp.id}
                  className={`hover:bg-rose-50/30 transition-colors ${
                    idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                  }`}
                >
                  <td className="py-2.5 px-3.5 font-mono font-bold text-rose-700 whitespace-nowrap">
                    {exp.id}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{exp.date}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 font-semibold text-slate-800">{exp.description}</td>
                  <td className="py-2.5 px-3.5 text-right font-bold text-rose-700 font-mono bg-rose-50/30">
                    ৳{exp.amount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-medium">{exp.approvedBy}</td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(exp)}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                        title="Edit Expense"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete expense ${exp.id}?`)) onDeleteExpense(exp.id);
                        }}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                        title="Delete Expense"
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
                <td colSpan={4} className="py-3 px-3 text-right">Total Operational Expenses:</td>
                <td className="py-3 px-3.5 text-right text-rose-700 font-mono">৳{totalExpenseSum.toLocaleString()}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingExpense ? 'খরচের ভাউচার এডিট করুন' : 'নতুন খরচের ভাউচার এন্ট্রি'}
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
                  <label className="block font-semibold text-slate-700 mb-1">Expense ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expense Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description (বিবরণ) *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  placeholder="e.g. Office printing papers and marker pens"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-rose-800 mb-1">Amount (টাকা ৳) *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border-2 border-rose-400 font-mono font-bold text-rose-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Approved By</label>
                  <input
                    type="text"
                    value={formData.approvedBy}
                    onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
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
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Expense</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
