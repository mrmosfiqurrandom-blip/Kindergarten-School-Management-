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
import { Student, Staff, FeeRecord, Expense, AcademicResult, SchoolInfo, AttendanceRecord, User } from './types';
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
import { LoginView } from './components/LoginView';
import { UserProfileModal } from './components/UserProfileModal';
import { exportKindergartenExcelWorkbook } from './utils/excelGenerator';
import {
  getStoredWebhookUrl,
  getStoredAutoSync,
  getStoredLastSync,
  sendToGoogleSheets,
  addSyncLog,
  loadStoredData,
  saveStoredData,
  STORAGE_KEYS,
  resetAllStoredSchoolData,
} from './utils/googleSheetsSync';
import { getStoredCurrentUser, logoutUser, INITIAL_USERS } from './utils/auth';
import { LiveSyncStatusBar } from './components/LiveSyncStatusBar';
import { FileSpreadsheet, Code2, Heart, Zap } from 'lucide-react';
import {
  testFirestoreConnection,
  seedInitialDataIfEmpty,
  subscribeToStudents,
  subscribeToFees,
  subscribeToStaff,
  subscribeToExpenses,
  subscribeToAttendance,
  subscribeToResults,
  subscribeToSchoolInfo,
  saveStudentToCloud,
  deleteStudentFromCloud,
  saveFeeRecordToCloud,
  deleteFeeRecordFromCloud,
  saveStaffToCloud,
  deleteStaffFromCloud,
  saveExpenseToCloud,
  deleteExpenseFromCloud,
  saveAttendanceRecordsToCloud,
  saveAcademicResultToCloud,
  deleteAcademicResultFromCloud,
  saveSchoolInfoToCloud,
} from './utils/firebase';

export default function App() {
  // Authentication State: Require username and password login by default
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return getStoredCurrentUser();
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(() =>
    loadStoredData(STORAGE_KEYS.LOCAL_SCHOOL, initialSchoolInfo)
  );
  const [students, setStudents] = useState<Student[]>(() =>
    loadStoredData(STORAGE_KEYS.LOCAL_STUDENTS, initialStudents)
  );
  const [staffList, setStaffList] = useState<Staff[]>(() =>
    loadStoredData(STORAGE_KEYS.LOCAL_STAFF, initialStaffList)
  );
  const [fees, setFees] = useState<FeeRecord[]>(() =>
    loadStoredData(STORAGE_KEYS.LOCAL_FEES, initialFeeRecords)
  );
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    loadStoredData(STORAGE_KEYS.LOCAL_EXPENSES, initialExpenses)
  );
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() =>
    loadStoredData(STORAGE_KEYS.LOCAL_ATTENDANCE, initialAttendance)
  );
  const [results, setResults] = useState<AcademicResult[]>(() =>
    loadStoredData(STORAGE_KEYS.LOCAL_RESULTS, initialAcademicResults)
  );

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<string>('KS-101');
  const [selectedStudentForReceipt, setSelectedStudentForReceipt] = useState<string>('KS-101');
  const [selectedMonthForReceipt, setSelectedMonthForReceipt] = useState<string>('January 2025');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isPythonModalOpen, setIsPythonModalOpen] = useState(false);
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState(false);
  const [isGoogleSheetsConnected, setIsGoogleSheetsConnected] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isSyncingGlobal, setIsSyncingGlobal] = useState(false);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<string | null>(getStoredLastSync());
  const [autoSyncNotification, setAutoSyncNotification] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // FIREBASE CLOUD REAL-TIME SYNCHRONIZATION ACROSS ALL DEVICES
  // --------------------------------------------------------------------------
  useEffect(() => {
    // 1. Test Firestore connectivity and bootstrap cloud database with initial data if fresh
    testFirestoreConnection().then((connected) => {
      if (connected) {
        seedInitialDataIfEmpty({
          students,
          fees,
          staff: staffList,
          expenses,
          attendance,
          results,
          schoolInfo,
        });
      }
    });

    // 2. Setup real-time listeners for all modules
    const unsubStudents = subscribeToStudents((cloudStudents) => {
      if (cloudStudents && cloudStudents.length > 0) {
        setStudents(cloudStudents);
      }
    });

    const unsubFees = subscribeToFees((cloudFees) => {
      if (cloudFees && cloudFees.length > 0) {
        setFees(cloudFees);
      }
    });

    const unsubStaff = subscribeToStaff((cloudStaff) => {
      if (cloudStaff && cloudStaff.length > 0) {
        setStaffList(cloudStaff);
      }
    });

    const unsubExpenses = subscribeToExpenses((cloudExpenses) => {
      if (cloudExpenses && cloudExpenses.length > 0) {
        setExpenses(cloudExpenses);
      }
    });

    const unsubAttendance = subscribeToAttendance((cloudAttendance) => {
      if (cloudAttendance && cloudAttendance.length > 0) {
        setAttendance(cloudAttendance);
      }
    });

    const unsubResults = subscribeToResults((cloudResults) => {
      if (cloudResults && cloudResults.length > 0) {
        setResults(cloudResults);
      }
    });

    const unsubSchoolInfo = subscribeToSchoolInfo((cloudInfo) => {
      if (cloudInfo && cloudInfo.name) {
        setSchoolInfo(cloudInfo);
      }
    });

    return () => {
      unsubStudents();
      unsubFees();
      unsubStaff();
      unsubExpenses();
      unsubAttendance();
      unsubResults();
      unsubSchoolInfo();
    };
  }, []);

  // If role is parent, automatically select their linked student if present
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'parent' && user.linkedStudentId) {
      setSelectedStudentForProfile(user.linkedStudentId);
      setSelectedStudentForReceipt(user.linkedStudentId);
      setActiveTab('profile');
    }
    setAutoSyncNotification(`স্বাগতম, ${user.name}! (${user.roleTitle})`);
    setTimeout(() => setAutoSyncNotification(null), 4000);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  const handleSwitchUser = (newUser: User) => {
    setCurrentUser(newUser);
    if (newUser.role === 'parent' && newUser.linkedStudentId) {
      setSelectedStudentForProfile(newUser.linkedStudentId);
      setSelectedStudentForReceipt(newUser.linkedStudentId);
      setActiveTab('profile');
    }
    setAutoSyncNotification(`ইউজার স্যুইচ করা হয়েছে: ${newUser.name} (${newUser.roleTitle})`);
    setTimeout(() => setAutoSyncNotification(null), 4000);
  };

  // Auto-Save all data locally whenever state updates so page refresh never loses data
  useEffect(() => {
    saveStoredData(STORAGE_KEYS.LOCAL_STUDENTS, students);
  }, [students]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.LOCAL_FEES, fees);
  }, [fees]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.LOCAL_STAFF, staffList);
  }, [staffList]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.LOCAL_EXPENSES, expenses);
  }, [expenses]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.LOCAL_ATTENDANCE, attendance);
  }, [attendance]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.LOCAL_RESULTS, results);
  }, [results]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.LOCAL_SCHOOL, schoolInfo);
  }, [schoolInfo]);

  useEffect(() => {
    const url = getStoredWebhookUrl();
    setIsGoogleSheetsConnected(Boolean(url && url.startsWith('http')));
  }, [isGoogleSheetsModalOpen, lastSyncTimestamp]);

  // Master 1-Click Sync All
  const handleManualSyncAll = async () => {
    const url = getStoredWebhookUrl();
    if (!url) {
      setIsGoogleSheetsModalOpen(true);
      return;
    }

    setIsSyncingGlobal(true);
    setAutoSyncNotification('গুগল শিটে সমস্ত ডেটা সিঙ্ক হচ্ছে...');

    const payload = {
      action: 'sync_all' as const,
      timestamp: new Date().toISOString(),
      schoolName: schoolInfo.name,
      students,
      fees,
      staff: staffList,
      expenses,
      attendance,
      results,
    };

    try {
      const res = await sendToGoogleSheets(url, payload);
      const totalRecs =
        students.length +
        fees.length +
        staffList.length +
        expenses.length +
        attendance.length +
        results.length;

      addSyncLog({
        type: 'Manual 1-Click Sync (All)',
        status: 'success',
        message: res.message,
        recordsCount: totalRecs,
      });

      const now = new Date().toISOString();
      setLastSyncTimestamp(now);
      setIsGoogleSheetsConnected(true);
      setAutoSyncNotification(`✅ সফলভাবে ${totalRecs}টি রেকর্ড গুগল শিটে সিঙ্ক হয়েছে!`);
      setTimeout(() => setAutoSyncNotification(null), 4000);
    } catch (err: any) {
      addSyncLog({
        type: 'Manual 1-Click Sync (All)',
        status: 'error',
        message: err.message || 'Sync failed',
      });
      setAutoSyncNotification(`⚠️ সিঙ্ক ত্রুটি: ${err.message || 'কানেকশন চেক করুন'}`);
      setTimeout(() => setAutoSyncNotification(null), 5000);
    } finally {
      setIsSyncingGlobal(false);
    }
  };

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
      const now = new Date().toISOString();
      setLastSyncTimestamp(now);
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

  // Handlers for Students with Cloud Firestore Real-time Sync
  const handleAddStudent = async (newStudent: Student) => {
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

    // Real-time Cloud Save
    try {
      await saveStudentToCloud(newStudent);
      await saveFeeRecordToCloud(feeRec);
    } catch (err) {
      console.warn('Cloud save error:', err);
    }

    triggerAutoSync('New Student', { students: updatedStudents, fees: updatedFees });
  };

  const handleUpdateStudent = async (updatedStudent: Student) => {
    const updated = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    setStudents(updated);
    try {
      await saveStudentToCloud(updatedStudent);
    } catch (err) {
      console.warn('Cloud update error:', err);
    }
    triggerAutoSync('Update Student', { students: updated });
  };

  const handleDeleteStudent = async (id: string) => {
    const updatedStudents = students.filter((s) => s.id !== id);
    const updatedFees = fees.filter((f) => f.studentId !== id);
    const updatedResults = results.filter((r) => r.studentId !== id);
    setStudents(updatedStudents);
    setFees(updatedFees);
    setResults(updatedResults);
    try {
      await deleteStudentFromCloud(id);
    } catch (err) {
      console.warn('Cloud delete error:', err);
    }
    triggerAutoSync('Delete Student', { students: updatedStudents, fees: updatedFees, results: updatedResults });
  };

  const handleViewProfile = (studentId: string) => {
    setSelectedStudentForProfile(studentId);
    setActiveTab('profile');
  };

  // Handlers for Fees with Cloud Firestore Sync
  const handleAddFeeRecord = async (rec: FeeRecord) => {
    const updated = [rec, ...fees];
    setFees(updated);
    try {
      await saveFeeRecordToCloud(rec);
    } catch (err) {
      console.warn('Cloud fee add error:', err);
    }
    triggerAutoSync('Fee Record', { fees: updated });
  };

  const handleUpdateFeeRecord = async (rec: FeeRecord) => {
    const updated = fees.map((f) => (f.id === rec.id ? rec : f));
    setFees(updated);
    try {
      await saveFeeRecordToCloud(rec);
    } catch (err) {
      console.warn('Cloud fee update error:', err);
    }
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

  // Handlers for Staff with Cloud Sync
  const handleAddStaff = async (st: Staff) => {
    const updated = [...staffList, st];
    setStaffList(updated);
    try {
      await saveStaffToCloud(st);
    } catch (err) {
      console.warn('Cloud staff add error:', err);
    }
    triggerAutoSync('New Staff', { staff: updated });
  };

  const handleUpdateStaff = async (st: Staff) => {
    const updated = staffList.map((item) => (item.id === st.id ? st : item));
    setStaffList(updated);
    try {
      await saveStaffToCloud(st);
    } catch (err) {
      console.warn('Cloud staff update error:', err);
    }
    triggerAutoSync('Update Staff', { staff: updated });
  };

  const handleDeleteStaff = async (id: string) => {
    const updated = staffList.filter((s) => s.id !== id);
    setStaffList(updated);
    try {
      await deleteStaffFromCloud(id);
    } catch (err) {
      console.warn('Cloud staff delete error:', err);
    }
    triggerAutoSync('Delete Staff', { staff: updated });
  };

  // Handlers for Expenses with Cloud Sync
  const handleAddExpense = async (exp: Expense) => {
    const updated = [exp, ...expenses];
    setExpenses(updated);
    try {
      await saveExpenseToCloud(exp);
    } catch (err) {
      console.warn('Cloud expense add error:', err);
    }
    triggerAutoSync('New Expense', { expenses: updated });
  };

  const handleUpdateExpense = async (exp: Expense) => {
    const updated = expenses.map((e) => (e.id === exp.id ? exp : e));
    setExpenses(updated);
    try {
      await saveExpenseToCloud(exp);
    } catch (err) {
      console.warn('Cloud expense update error:', err);
    }
    triggerAutoSync('Update Expense', { expenses: updated });
  };

  const handleDeleteExpense = async (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    try {
      await deleteExpenseFromCloud(id);
    } catch (err) {
      console.warn('Cloud expense delete error:', err);
    }
    triggerAutoSync('Delete Expense', { expenses: updated });
  };

  // Handlers for Results with Cloud Sync
  const handleAddResult = async (res: AcademicResult) => {
    const updated = [res, ...results];
    setResults(updated);
    try {
      await saveAcademicResultToCloud(res);
    } catch (err) {
      console.warn('Cloud result add error:', err);
    }
    triggerAutoSync('New Result', { results: updated });
  };

  const handleUpdateResult = async (res: AcademicResult) => {
    const updated = results.map((r) => (r.id === res.id ? res : r));
    setResults(updated);
    try {
      await saveAcademicResultToCloud(res);
    } catch (err) {
      console.warn('Cloud result update error:', err);
    }
    triggerAutoSync('Update Result', { results: updated });
  };

  // Handlers for Attendance with Cloud Sync
  const handleSaveAttendance = async (records: AttendanceRecord[]) => {
    setAttendance(records);
    try {
      await saveAttendanceRecordsToCloud(records);
    } catch (err) {
      console.warn('Cloud attendance save error:', err);
    }
    triggerAutoSync('Update Attendance', { attendance: records });
    setAutoSyncNotification('হাজিরা খাতা সেন্ট্রাল ক্লাউডে ও সকল ডিভাইসে সংরক্ষিত হয়েছে!');
    setTimeout(() => setAutoSyncNotification(null), 3000);
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

  // Restore from backup JSON
  const handleRestoreBackup = (data: any) => {
    if (data.students && Array.isArray(data.students)) setStudents(data.students);
    if (data.fees && Array.isArray(data.fees)) setFees(data.fees);
    if (data.staff && Array.isArray(data.staff)) setStaffList(data.staff);
    if (data.expenses && Array.isArray(data.expenses)) setExpenses(data.expenses);
    if (data.attendance && Array.isArray(data.attendance)) setAttendance(data.attendance);
    if (data.results && Array.isArray(data.results)) setResults(data.results);
    if (data.schoolInfo) setSchoolInfo(data.schoolInfo);
    setAutoSyncNotification('ব্যাকআপ থেকে সকল তথ্য পুনরুদ্ধার করা হয়েছে!');
    setTimeout(() => setAutoSyncNotification(null), 4000);
  };

  // Reset to original demo sample data
  const handleResetToDemoData = () => {
    resetAllStoredSchoolData();
    setStudents(initialStudents);
    setFees(initialFeeRecords);
    setStaffList(initialStaffList);
    setExpenses(initialExpenses);
    setAttendance(initialAttendance);
    setResults(initialAcademicResults);
    setSchoolInfo(initialSchoolInfo);
    setAutoSyncNotification('সকল তথ্য ডিফল্ট ডেমো ডেটায় রিসেট করা হয়েছে!');
    setTimeout(() => setAutoSyncNotification(null), 4000);
  };

  // If user is not logged in, show Login Screen
  if (!currentUser) {
    return <LoginView schoolInfo={schoolInfo} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col font-sans antialiased">
      {/* Left Sidebar Menubar & Fixed Header Bar */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        schoolInfo={schoolInfo}
        currentUser={currentUser}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
        onExportExcel={handleExportExcel}
        onOpenPythonScript={() => setIsPythonModalOpen(true)}
        onOpenGoogleSheetsSync={() => setIsGoogleSheetsModalOpen(true)}
        isGoogleSheetsConnected={isGoogleSheetsConnected}
        onPrint={handlePrint}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
      />

      {/* Main Content Workspace (Padded for Left Sidebar on Desktop) */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Live Google Sheets Status Bar */}
        <LiveSyncStatusBar
          onOpenSyncModal={() => setIsGoogleSheetsModalOpen(true)}
          onManualSyncAll={handleManualSyncAll}
          isSyncing={isSyncingGlobal}
          lastSyncTimestamp={lastSyncTimestamp}
        />

        {/* Auto-Sync Toast Notification */}
        {autoSyncNotification && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-emerald-500/40 text-xs font-semibold flex items-center gap-2.5 animate-bounce">
            <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{autoSyncNotification}</span>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 w-full p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto">
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
              onUpdateStudent={handleUpdateStudent}
              onSelectStudentForReceipt={handleGenerateReceipt}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView
              students={students}
              attendance={attendance}
              onSaveAttendance={handleSaveAttendance}
              currentUser={currentUser}
            />
          )}

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
        <footer className="bg-slate-900 text-slate-400 py-4 px-4 sm:px-8 border-t border-slate-800 print:hidden text-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-slate-200">{schoolInfo.name}</span>
              <span>— স্কুল ম্যানেজমেন্ট ও অটোমেশন পোর্টাল</span>
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
                <span>Python Script</span>
              </button>
            </div>
          </div>
        </footer>
      </div>

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
        onRestoreBackup={handleRestoreBackup}
        onResetToDemoData={handleResetToDemoData}
        onSyncComplete={() => {
          const url = getStoredWebhookUrl();
          setIsGoogleSheetsConnected(Boolean(url && url.startsWith('http')));
        }}
      />

      {/* User Profile & Security Modal */}
      {currentUser && (
        <UserProfileModal
          currentUser={currentUser}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onLogout={handleLogout}
          onSwitchUser={handleSwitchUser}
        />
      )}
    </div>
  );
}
