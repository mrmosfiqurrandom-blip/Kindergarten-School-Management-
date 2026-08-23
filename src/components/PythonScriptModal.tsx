import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Download,
  Check,
  X,
  FileCode,
  Terminal,
  Sparkles,
} from 'lucide-react';
import { generatePythonScriptCode } from '../utils/pythonScriptGenerator';
import { SchoolInfo } from '../types';

interface PythonScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolInfo: SchoolInfo;
}

export const PythonScriptModal: React.FC<PythonScriptModalProps> = ({
  isOpen,
  onClose,
  schoolInfo,
}) => {
  const [copied, setCopied] = useState(false);
  const pythonCode = generatePythonScriptCode(schoolInfo);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([pythonCode], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'generate_kindergarten_sheets.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 text-slate-100 rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-700 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  Python (openpyxl) Automation Script
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  All 10 Worksheets Included
                </span>
              </div>
              <p className="text-xs text-slate-400">
                সম্পূর্ণ পাইথন স্ক্রিপ্ট যা লোকাল মেশিনে রান করে সরাসরি অটোমেটেড এক্সেল ফাইল জেনারেট করবে
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Code!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download .py Script</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Command instructions bar */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 my-3 flex items-center justify-between text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>How to run:</span>
            <code className="text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              pip install openpyxl
            </code>
            <span>then</span>
            <code className="text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              python generate_kindergarten_sheets.py
            </code>
          </div>
          <span className="text-[11px] text-slate-500 font-sans">
            Creates <span className="text-slate-300">Kindergarten_School_System_Automated.xlsx</span>
          </span>
        </div>

        {/* Code Content Container */}
        <div className="flex-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 flex flex-col">
          <div className="bg-slate-900/90 px-4 py-2 text-[11px] text-slate-400 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>generate_kindergarten_sheets.py ({pythonCode.split('\n').length} lines)</span>
            </div>
            <span className="text-slate-500">Python 3.8+ / openpyxl</span>
          </div>

          <pre className="flex-1 overflow-y-auto p-4 text-xs font-mono text-emerald-300/90 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800 select-all">
            <code>{pythonCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
