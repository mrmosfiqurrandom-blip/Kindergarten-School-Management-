import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Filter,
  Sparkles,
  Phone,
  Check,
} from 'lucide-react';
import { Student, FeeRecord, SchoolInfo } from '../types';

interface WhatsAppAlertsViewProps {
  students: Student[];
  fees: FeeRecord[];
  schoolInfo: SchoolInfo;
}

export const WhatsAppAlertsView: React.FC<WhatsAppAlertsViewProps> = ({
  students,
  fees,
  schoolInfo,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Custom template
  const [messageTemplate, setMessageTemplate] = useState<string>(
    `প্রিয় অভিভাবক, {school} থেকে বিনীতভাবে জানানো যাচ্ছে যে আপনার সন্তান {name} (ID: {id}, Class: {class}) এর {month} মাসের বকেয়া ফি ৳{due} টাকা। অনুগ্রহ করে দ্রুত পরিশোধ করুন। ধন্যবাদ। - {school}`
  );

  const dueList = students.map((s) => {
    const studentFees = fees.filter((f) => f.studentId === s.id);
    const totalPayable = studentFees.reduce((acc, f) => acc + f.totalPayable, 0);
    const amountPaid = studentFees.reduce((acc, f) => acc + f.amountPaid, 0);
    const dueAmount = studentFees.reduce((acc, f) => acc + f.dueAmount, 0);
    const latestMonth = studentFees[0]?.month || 'Current Month';

    const formattedMessage = messageTemplate
      .replace(/{school}/g, schoolInfo.name)
      .replace(/{name}/g, s.name)
      .replace(/{id}/g, s.id)
      .replace(/{class}/g, s.studentClass)
      .replace(/{month}/g, latestMonth)
      .replace(/{due}/g, dueAmount.toLocaleString());

    // Clean phone number for WhatsApp link
    let phoneClean = s.contactNumber.replace(/[^0-9]/g, '');
    if (phoneClean.startsWith('01')) {
      phoneClean = '880' + phoneClean.slice(1);
    }

    const waLink = `https://wa.me/${phoneClean}?text=${encodeURIComponent(formattedMessage)}`;

    return {
      student: s,
      totalPayable,
      amountPaid,
      dueAmount,
      latestMonth,
      formattedMessage,
      waLink,
      hasDue: dueAmount > 0,
    };
  });

  const filteredDueList = dueList.filter((item) => {
    return selectedClass === 'All' || item.student.studentClass === selectedClass;
  });

  const dueOnlyList = filteredDueList.filter((i) => i.hasDue);
  const totalDueSum = dueOnlyList.reduce((acc, i) => acc + i.dueAmount, 0);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">📲 Automated WhatsApp Due Notice & Reminder</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              Sheet 7: বকেয়া ও হোয়াটসঅ্যাপ অ্যালার্ট
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            এক্সেল হাইপারলিংক <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-bold">=HYPERLINK("https://wa.me/...", "Send")</code> দ্বারা সরাসরি ১-ক্লিকে হোয়াটসঅ্যাপ মেসেজ পাঠানো
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-600 font-medium">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
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
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Total Students Evaluated</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{filteredDueList.length}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-200 bg-amber-50/40">
          <div className="text-xs text-amber-800 font-medium">Students with Pending Dues</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{dueOnlyList.length} Students</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-rose-200 bg-rose-50/40">
          <div className="text-xs text-rose-800 font-medium">Total Pending Amount</div>
          <div className="text-2xl font-bold text-rose-700 mt-1">৳{totalDueSum.toLocaleString()}</div>
        </div>
      </div>

      {/* Message Template Customizer */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 text-xs">
        <div className="flex items-center justify-between mb-2">
          <label className="font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>অটোমেটেড বাংলা এসএমএস/হোয়াটসঅ্যাপ মেসেজ টেমপ্লেট:</span>
          </label>
          <span className="text-[11px] text-slate-400">Placeholders: &#123;name&#125;, &#123;id&#125;, &#123;class&#125;, &#123;due&#125;, &#123;month&#125;, &#123;school&#125;</span>
        </div>
        <textarea
          rows={2}
          value={messageTemplate}
          onChange={(e) => setMessageTemplate(e.target.value)}
          className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-sans text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold whitespace-nowrap">
                <th className="py-3 px-3.5">ID</th>
                <th className="py-3 px-3.5">Student Name</th>
                <th className="py-3 px-2.5 text-center">Class</th>
                <th className="py-3 px-3">Parent Contact (WhatsApp)</th>
                <th className="py-3 px-3 text-right">Billed (৳)</th>
                <th className="py-3 px-3 text-right">Paid (৳)</th>
                <th className="py-3 px-3 text-right bg-amber-950">Due Balance</th>
                <th className="py-3 px-2.5 text-center">Status</th>
                <th className="py-3 px-4 text-center bg-emerald-950">1-Click WhatsApp Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredDueList.map((item, idx) => (
                <tr
                  key={item.student.id}
                  className={`hover:bg-blue-50/40 transition-colors ${
                    idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                  }`}
                >
                  <td className="py-2.5 px-3.5 font-mono font-bold text-blue-700 whitespace-nowrap">
                    {item.student.id}
                  </td>
                  <td className="py-2.5 px-3.5">
                    <div className="font-bold text-slate-900">{item.student.name}</div>
                    <div className="text-[10px] text-slate-400">Guardian: {item.student.fatherName}</div>
                  </td>
                  <td className="py-2.5 px-2.5 text-center">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      {item.student.studentClass}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>{item.student.contactNumber}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600 font-mono">
                    ৳{item.totalPayable.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold font-mono">
                    ৳{item.amountPaid.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold font-mono bg-amber-50/30">
                    {item.hasDue ? (
                      <span className="text-amber-700">৳{item.dueAmount.toLocaleString()}</span>
                    ) : (
                      <span className="text-emerald-600">৳0</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2.5 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.hasDue
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.hasDue ? 'DUE PENDING' : 'CLEARED'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-center whitespace-nowrap">
                    {item.hasDue ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <a
                          href={item.waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-700/30 transition-all hover:scale-105 active:scale-95"
                          title="Open WhatsApp Chat with prefilled Bengali message"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send WhatsApp Notice</span>
                        </a>

                        <button
                          onClick={() => handleCopyMessage(item.student.id, item.formattedMessage)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          title="Copy notice text to clipboard"
                        >
                          {copiedId === item.student.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-emerald-700 text-xs font-semibold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>No Dues Pending</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
