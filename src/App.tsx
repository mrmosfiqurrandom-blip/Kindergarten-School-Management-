import React, { useState, useEffect } from 'react';
import {
  initialSchoolInfo,
  initialStudents,
  initialStaffList,
  initialFeeRecords,
  initialExpenses,
  initialAttendance,
  initialAcademicResults,
} from './data/initialData';
import { Student, Staff, FeeRecord, Expense, AcademicResult, SchoolInfo, AttendanceRecord } from './types';
import { Navigation, ActiveTab } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { StudentDatabaseView } from './components/StudentDatabaseView';
import { StudentProfileView } from './components/StudentProfileView';
import { AttendanceView } from './components/AttendanceView';
import { FeeManagementView } from './components/FeeManagementView';
import { FeeReceiptView } from './components/FeeReceiptView';
import { WhatsAppAlertsView } from './components/WhatsAppAlertsView';
import { StaffPayrollView } from './components/StaffPayrollView';
import { ExpenseTrackerView } from './components/ExpenseTrackerView';
import { AcademicResultsView } from './components/AcademicResultsView';
import { PythonScriptModal } from './components/PythonScriptModal';
import { GoogleSheetsSyncModal } from './components/GoogleSheetsSyncModal';
import { exportKindergartenExcelWorkbook } from './utils/excelGenerator';
import {
  getStoredWebhookUrl,
  getStoredAutoSync,
  sendToGoogleSheets,
  addSyncLog,
} from './utils/googleSheetsSync';
import { FileSpreadsheet, Code2, Heart, Zap } from 'lucide-react';

export default function App() {
  const [schoolInfo] = useState<SchoolInfo>(initialSchoolInfo);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [staffList, setStaffList] = useState<Staff[]>(initialStaffList);
  const [fees, setFees] = useState<FeeRecord[]>(initialFeeRecords);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance);
  const [results, setResults] = useState<AcademicResult[]>(initialAcademicResults);

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<string>('KS-101');
  const [selectedStudentForReceipt, setSelectedStudentForReceipt] = useState<string>('KS-101');
  const [selectedMonthForReceipt, setSelectedMonthForReceipt] = useState<string>('January 2025');

  const [isPythonModalOpen, setIsPythonModalOpen] = useState(false);
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState(false);
  const [isGoogleSheetsConnected, setIsGoogleSheetsConnected] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [autoSyncNotification, setAutoSyncNotification] = useState<string | null>(null);

  useEffect(() => {
    const url = getStoredWebhookUrl();
    setIsGoogleSheetsConnected(Boolean(url && url.startsWith('http')));
  }, [isGoogleSheetsModalOpen]);

  // Background Auto-Sync Trigger
  const triggerAutoSync = async (moduleType: string, updatedData: any) => {
    const url = getStoredWebhookUrl();
    const isAuto = getStoredAutoSync();
    if (!url || !isAuto) return;

    try {
      setAutoSyncNotification(`গুগল শিটে অটো-সিঙ্ক হচ্ছে (${moduleType})...`);
      const payload = {
        action: 'sync_all' as const,
        timestamp: new Date().toISOString(),
        schoolName: schoolInfo.name,
        students: updatedData.students || students,
        fees: updatedData.fees || fees,
        staff: updatedData.staff || staffList,
        expenses: updatedData.expenses || expenses,
        attendance: updatedData.attendance || attendance,
        results: updatedData.results || results,
      };

      await sendToGoogleSheets(url, payload);
      addSyncLog({
        type: `Auto-Sync (${moduleType})`,
        status: 'success',
        message: `${moduleType} ডেটা সফলভাবে গুগল শিটে পুশ হয়েছে।`,
      });
      setAutoSyncNotification(`✅ গুগল শিটে ${moduleType} অটো-সিঙ্ক সম্পন্ন!`);
      setTimeout(() => setAutoSyncNotification(null), 3500);
    } catch (e: any) {
      console.warn('Auto sync warning:', e);
      addSyncLog({
        type: `Auto-Sync (${moduleType})`,
        status: 'error',
        message: e.message || 'Auto-sync failed',
      });
      setAutoSyncNotification(null);
    }
  };

  // Handlers for Students
  const handleAddStudent = (newStudent: Student) => {
    const updatedStudents = [newStudent, ...students];
    setStudents(updatedStudents);

    // Create initial fee record
    const feeRec: FeeRecord = {
      id: `FEE-${Date.now()}`,
      studentId: newStudent.id,
      studentName: newStudent.name,
      studentClass: newStudent.studentClass,
      month: 'January 2025',
      admissionFee: 5000,
      monthlyTuitionFee: 2500,
      examFee: 0,
      transportFee: 0,
      fineFee: 0,
      totalPayable: 7500,
      amountPaid: 7500,
      dueAmount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentStatus: 'Paid',
      receiptNo: `REC-2025-${Math.floor(100 + Math.random() * 900)}`,
      paymentMethod: 'Cash',
    };
    const updatedFees = [feeRec, ...fees];
    setFees(updatedFees);

    triggerAutoSync('New Student', { students: updatedStudents, fees: updatedFees });
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    const updated = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    setStudents(updated);
    triggerAutoSync('Update Student', { students: updated });
  };

  const handleDeleteStudent = (id: string) => {
    const updatedStudents = students.filter((s) => s.id !== id);
    const updatedFees = fees.filter((f) => f.studentId !== id);
    const updatedResults = results.filter((r) => r.studentId !== id);
    setStudents(updatedStudents);
    setFees(updatedFees);
    setResults(updatedResults);
    triggerAutoSync('Delete Student', { students: updatedStudents, fees: updatedFees, results: updatedResults });
  };

  const handleViewProfile = (studentId: string) => {
    setSelectedStudentForProfile(studentId);
    setActiveTab('profile');
  };

  // Handlers for Fees
  const handleAddFeeRecord = (rec: FeeRecord) => {
    const updated = [rec, ...fees];
    setFees(updated);
    triggerAutoSync('Fee Record', { fees: updated });
  };

  const handleUpdateFeeRecord = (rec: FeeRecord) => {
    const updated = fees.map((f) => (f.id === rec.id ? rec : f));
    setFees(updated);
    triggerAutoSync('Update Fee', { fees: updated });
  };

  const handleGenerateReceipt = (studentId: string, month: string) => {
    setSelectedStudentForReceipt(studentId);
    setSelectedMonthForReceipt(month);
    setActiveTab('receipt');
  };

  const handleSendWhatsApp = (studentId: string) => {
    setSelectedStudentForProfile(studentId);
    setActiveTab('due_alerts');
  };

  // Handlers for Staff
  const handleAddStaff = (st: Staff) => {
    const updated = [...staffList, st];
    setStaffList(updated);
    triggerAutoSync('New Staff', { staff: updated });
  };

  const handleUpdateStaff = (st: Staff) => {
    const updated = staffList.map((item) => (item.id === st.id ? st : item));
    setStaffList(updated);
    triggerAutoSync('Update Staff', { staff: updated });
  };

  const handleDeleteStaff = (id: string) => {
    const updated = staffList.filter((s) => s.id !== id);
    setStaffList(updated);
    triggerAutoSync('Delete Staff', { staff: updated });
  };

  // Handlers for Expenses
  const handleAddExpense = (exp: Expense) => {
    const updated = [exp, ...expenses];
    setExpenses(updated);
    triggerAutoSync('New Expense', { expenses: updated });
  };

  const handleUpdateExpense = (exp: Expense) => {
    const updated = expenses.map((e) => (e.id === exp.id ? exp : e));
    setExpenses(updated);
    triggerAutoSync('Update Expense', { expenses: updated });
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    triggerAutoSync('Delete Expense', { expenses: updated });
  };

  // Handlers for Results
  const handleAddResult = (res: AcademicResult) => {
    const updated = [res, ...results];
    setResults(updated);
    triggerAutoSync('New Result', { results: updated });
  };

  const handleUpdateResult = (res: AcademicResult) => {
    const updated = results.map((r) => (r.id === res.id ? res : r));
    setResults(updated);
    triggerAutoSync('Update Result', { results: updated });
  };

  // Export Excel
  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      await exportKindergartenExcelWorkbook(
        schoolInfo,
        students,
        fees,
        staffList,
        expenses,
        attendance,
        results
      );
    } catch (err) {
      console.error('Error generating Excel file:', err);
      alert('Failed to generate Excel file. Please try again.');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Header & 10-Sheet Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        schoolInfo={schoolInfo}
        onExportExcel={handleExportExcel}
        onOpenPythonScript={() => setIsPythonModalOpen(true)}
        onOpenGoogleSheetsSync={() => setIsGoogleSheetsModalOpen(true)}
        isGoogleSheetsConnected={isGoogleSheetsConnected}
        onPrint={handlePrint}
      />

      {/* Auto-Sync Toast Notification */}
      {autoSyncNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-emerald-500/40 text-xs font-semibold flex items-center gap-2.5 animate-bounce">
          <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>{autoSyncNotification}</span>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            students={students}
            staffList={staffList}
            fees={fees}
            expenses={expenses}
            results={results}
            onNavigate={(tab) => setActiveTab(tab)}
            onExportExcel={handleExportExcel}
            onOpenGoogleSheetsSync={() => setIsGoogleSheetsModalOpen(true)}
          />
        )}

        {activeTab === 'students' && (
          <StudentDatabaseView
            students={students}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onViewProfile={handleViewProfile}
          />
        )}

        {activeTab === 'profile' && (
          <StudentProfileView
            students={students}
            fees={fees}
            results={results}
            attendance={attendance}
            schoolInfo={schoolInfo}
            selectedStudentId={selectedStudentForProfile}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'attendance' && <AttendanceView students={students} />}

        {activeTab === 'fees' && (
          <FeeManagementView
            fees={fees}
            students={students}
            onAddFeeRecord={handleAddFeeRecord}
            onUpdateFeeRecord={handleUpdateFeeRecord}
            onGenerateReceipt={handleGenerateReceipt}
            onSendWhatsApp={handleSendWhatsApp}
          />
        )}

        {activeTab === 'receipt' && (
          <FeeReceiptView
            students={students}
            fees={fees}
            schoolInfo={schoolInfo}
            selectedStudentId={selectedStudentForReceipt}
            selectedMonth={selectedMonthForReceipt}
          />
        )}

        {activeTab === 'due_alerts' && (
          <WhatsAppAlertsView students={students} fees={fees} schoolInfo={schoolInfo} />
        )}

        {activeTab === 'payroll' && (
          <StaffPayrollView
            staffList={staffList}
            onAddStaff={handleAddStaff}
            onUpdateStaff={handleUpdateStaff}
            onDeleteStaff={handleDeleteStaff}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseTrackerView
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'results' && (
          <AcademicResultsView
            results={results}
            students={students}
            schoolInfo={schoolInfo}
            onAddResult={handleAddResult}
            onUpdateResult={handleUpdateResult}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 print:hidden text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-slate-200">{schoolInfo.name}</span>
            <span>— Kindergarten Excel & Python Automation System</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsGoogleSheetsModalOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Google Sheets Live Sync</span>
            </button>
            <span>•</span>
            <button
              onClick={handleExportExcel}
              disabled={isExportingExcel}
              className="text-slate-300 hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isExportingExcel ? 'Generating .xlsx...' : 'Direct Excel (.xlsx)'}</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsPythonModalOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Python (openpyxl) Script</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Python Script Modal */}
      <PythonScriptModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
        schoolInfo={schoolInfo}
      />

      {/* Google Sheets Sync Hub Modal */}
      <GoogleSheetsSyncModal
        isOpen={isGoogleSheetsModalOpen}
        onClose={() => {
          setIsGoogleSheetsModalOpen(false);
          const url = getStoredWebhookUrl();
          setIsGoogleSheetsConnected(Boolean(url && url.startsWith('http')));
        }}
        schoolInfo={schoolInfo}
        students={students}
        fees={fees}
        staffList={staffList}
        expenses={expenses}
        attendance={attendance}
        results={results}
        onSyncComplete={() => {
          const url = getStoredWebhookUrl();
          setIsGoogleSheetsConnected(Boolean(url && url.startsWith('http')));
        }}
      />
    </div>
  );
}
