import {
  Student,
  FeeRecord,
  Staff,
  Expense,
  AcademicResult,
  AttendanceRecord,
  SchoolInfo,
} from '../types';

export interface SyncPayload {
  action: 'sync_all' | 'sync_students' | 'sync_fees' | 'sync_staff' | 'sync_expenses' | 'sync_attendance' | 'sync_results' | 'ping';
  timestamp: string;
  schoolName: string;
  students?: Student[];
  fees?: FeeRecord[];
  staff?: Staff[];
  expenses?: Expense[];
  attendance?: AttendanceRecord[];
  results?: AcademicResult[];
}

export interface SyncLog {
  id: string;
  timestamp: string;
  type: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  recordsCount?: number;
}

export const STORAGE_KEYS = {
  WEBHOOK_URL: 'ks_gsheets_webhook_url',
  AUTO_SYNC: 'ks_gsheets_auto_sync',
  LAST_SYNC: 'ks_gsheets_last_sync',
  SYNC_LOGS: 'ks_gsheets_sync_logs',
};

export const getStoredWebhookUrl = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEYS.WEBHOOK_URL) || '';
};

export const setStoredWebhookUrl = (url: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.WEBHOOK_URL, url.trim());
  }
};

export const getStoredAutoSync = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.AUTO_SYNC) === 'true';
};

export const setStoredAutoSync = (enabled: boolean) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.AUTO_SYNC, enabled ? 'true' : 'false');
  }
};

export const getStoredLastSync = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
};

export const getStoredSyncLogs = (): SyncLog[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SYNC_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addSyncLog = (log: Omit<SyncLog, 'id' | 'timestamp'>) => {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredSyncLogs();
    const newLog: SyncLog = {
      ...log,
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }) + ', ' + new Date().toLocaleDateString('en-GB'),
    };
    const updated = [newLog, ...existing].slice(0, 30); // keep last 30 logs
    localStorage.setItem(STORAGE_KEYS.SYNC_LOGS, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  } catch (e) {
    console.error('Failed to store sync log:', e);
  }
};

/**
 * Send payload to Google Apps Script Webhook
 */
export const sendToGoogleSheets = async (
  webhookUrl: string,
  payload: SyncPayload
): Promise<{ success: boolean; message: string; details?: any }> => {
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    throw new Error('দয়া করে একটি সঠিক Google Apps Script Webhook URL প্রদান করুন।');
  }

  try {
    // Google Apps Script requires text/plain or no-cors handling for cross-origin POST
    // We send payload as JSON string. Google Apps Script parses e.postData.contents.
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok && response.status !== 0) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    try {
      const data = await response.json();
      return {
        success: data.status === 'success' || data.result === 'success',
        message: data.message || 'গুগল শিটে সফলভাবে ডেটা সিঙ্ক সম্পন্ন হয়েছে!',
        details: data,
      };
    } catch {
      // If CORS or redirect prevented reading response body directly,
      // the request still reached Apps Script in standard web app setups.
      return {
        success: true,
        message: 'গুগল শিটে ডেটা প্রেরণ করা হয়েছে (Data pushed successfully)!',
      };
    }
  } catch (err: any) {
    console.warn('Sync request sent with note:', err);
    // Many Google Apps Script Web Apps succeed on server but throw CORS warning in browser fetch.
    // We provide a clear informative status.
    if (err.message && err.message.includes('Failed to fetch')) {
      return {
        success: true,
        message: 'গুগল শিটে ডেটা পাঠানো হয়েছে (Request dispatched to Google Sheets). অনুগ্রহ করে শিট চেক করুন।',
      };
    }
    throw new Error(err.message || 'গুগল শিটে সংযোগ স্থাপন করা সম্ভব হয়নি।');
  }
};

/**
 * Full copy-paste ready Google Apps Script Code for Google Sheets
 */
export const generateGoogleAppsScriptCode = (schoolName: string = 'Sunshine Kindergarten School'): string => {
  return `/**
 * ==============================================================================
 * 🌟 KINDERGARTEN SCHOOL MANAGEMENT - GOOGLE APPS SCRIPT WEBHOOK SYNC
 * ==============================================================================
 * এই স্ক্রিপ্টটি আপনার গুগল স্প্রেডশিটে স্বয়ংক্রিয়ভাবে ৬টি আলাদা আলাদা ট্যাব
 * (Students, Fees, Staff, Expenses, Results, Attendance) তৈরি ও আপডেট করবে।
 * 
 * স্কুল: ${schoolName}
 * ভার্সন: 2.0 (Automated Multi-Sheet Engine)
 * ==============================================================================
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    message: "Google Apps Script Webhook is active and listening!",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); // 30 seconds wait
    
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var action = data.action || 'sync_all';
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var results = {};
    
    // 1. PING TEST
    if (action === 'ping') {
      return responseSuccess("Connection test successful! Google Sheet is connected.", { sheetName: ss.getName() });
    }
    
    // 2. STUDENTS SYNC
    if (action === 'sync_all' || action === 'sync_students') {
      if (data.students && data.students.length > 0) {
        results.students = syncStudentsSheet(ss, data.students);
      }
    }
    
    // 3. FEES SYNC
    if (action === 'sync_all' || action === 'sync_fees') {
      if (data.fees && data.fees.length > 0) {
        results.fees = syncFeesSheet(ss, data.fees);
      }
    }
    
    // 4. STAFF & PAYROLL SYNC
    if (action === 'sync_all' || action === 'sync_staff') {
      if (data.staff && data.staff.length > 0) {
        results.staff = syncStaffSheet(ss, data.staff);
      }
    }
    
    // 5. EXPENSES SYNC
    if (action === 'sync_all' || action === 'sync_expenses') {
      if (data.expenses && data.expenses.length > 0) {
        results.expenses = syncExpensesSheet(ss, data.expenses);
      }
    }
    
    // 6. ACADEMIC RESULTS SYNC
    if (action === 'sync_all' || action === 'sync_results') {
      if (data.results && data.results.length > 0) {
        results.results = syncResultsSheet(ss, data.results);
      }
    }
    
    // 7. ATTENDANCE SYNC
    if (action === 'sync_all' || action === 'sync_attendance') {
      if (data.attendance && data.attendance.length > 0) {
        results.attendance = syncAttendanceSheet(ss, data.attendance);
      }
    }
    
    return responseSuccess("All data synced successfully to Google Sheets!", results);
    
  } catch (error) {
    return responseError("Error processing sync: " + error.toString());
  } finally {
    lock.releaseLock();
  }
}

// ------------------------------------------------------------------------------
// HELPER: GET OR CREATE SHEET WITH STYLING
// ------------------------------------------------------------------------------
function getOrCreateSheet(ss, sheetName, tabColor) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  if (tabColor) {
    sheet.setTabColor(tabColor);
  }
  return sheet;
}

function styleHeaderRow(sheet, headers, bgHex) {
  sheet.clear();
  sheet.appendRow(headers);
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground(bgHex || "#1e293b");
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  headerRange.setFontFamily("Arial");
  headerRange.setFontSize(10);
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
}

// ------------------------------------------------------------------------------
// 1. SYNC STUDENTS SHEET
// ------------------------------------------------------------------------------
function syncStudentsSheet(ss, students) {
  var sheet = getOrCreateSheet(ss, "1_Students", "#2563eb");
  var headers = [
    "Student ID", "Student Name", "Name (বাংলা)", "Class", "Section",
    "Roll No", "Father Name", "Mother Name", "Contact Mobile", "Emergency Mobile",
    "Blood Group", "Address", "Admission Date", "Status"
  ];
  styleHeaderRow(sheet, headers, "#1e3a8a");
  
  var rows = students.map(function(s) {
    return [
      s.id, s.name, s.nameBn || "", s.studentClass, s.section || "A",
      s.rollNo, s.fatherName || "", s.motherName || "", s.contactNumber || "", s.emergencyContact || "",
      s.bloodGroup || "", s.address || "", s.admissionDate || "", s.status || "Active"
    ];
  });
  
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    sheet.getRange(2, 1, rows.length, 1).setFontWeight("bold").setFontColor("#1e3a8a");
  }
  sheet.autoResizeColumns(1, headers.length);
  return rows.length;
}

// ------------------------------------------------------------------------------
// 2. SYNC FEES SHEET
// ------------------------------------------------------------------------------
function syncFeesSheet(ss, fees) {
  var sheet = getOrCreateSheet(ss, "2_Fee_Ledger", "#059669");
  var headers = [
    "Invoice / Fee ID", "Student ID", "Student Name", "Class", "Month",
    "Admission Fee", "Tuition Fee", "Exam Fee", "Transport Fee", "Fine",
    "Total Payable (৳)", "Amount Paid (৳)", "Due Amount (৳)", "Payment Date",
    "Payment Method", "Receipt No", "Status"
  ];
  styleHeaderRow(sheet, headers, "#065f46");
  
  var rows = fees.map(function(f) {
    return [
      f.id, f.studentId, f.studentName, f.studentClass, f.month,
      f.admissionFee || 0, f.monthlyTuitionFee || 0, f.examFee || 0, f.transportFee || 0, f.fineFee || 0,
      f.totalPayable || 0, f.amountPaid || 0, f.dueAmount || 0, f.paymentDate || "",
      f.paymentMethod || "Cash", f.receiptNo || "", f.paymentStatus || "Paid"
    ];
  });
  
  if (rows.length > 0) {
    var dataRange = sheet.getRange(2, 1, rows.length, headers.length);
    dataRange.setValues(rows);
    // Currency formatting for amounts (cols 6 to 13)
    sheet.getRange(2, 6, rows.length, 8).setNumberFormat("#,##0");
  }
  sheet.autoResizeColumns(1, headers.length);
  return rows.length;
}

// ------------------------------------------------------------------------------
// 3. SYNC STAFF & PAYROLL SHEET
// ------------------------------------------------------------------------------
function syncStaffSheet(ss, staffList) {
  var sheet = getOrCreateSheet(ss, "3_Staff_Payroll", "#7c3aed");
  var headers = [
    "Staff ID", "Full Name", "Designation", "Contact No",
    "Basic Salary (৳)", "Allowances (৳)", "Deductions (৳)",
    "Net Salary (৳)", "Payment Date", "Payment Status"
  ];
  styleHeaderRow(sheet, headers, "#5b21b6");
  
  var rows = staffList.map(function(st) {
    return [
      st.id, st.name, st.designation, st.contact || "",
      st.basicSalary || 0, st.allowances || 0, st.deductions || 0,
      st.netSalary || 0, st.paymentDate || "", st.status || "Paid"
    ];
  });
  
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    sheet.getRange(2, 5, rows.length, 4).setNumberFormat("#,##0");
  }
  sheet.autoResizeColumns(1, headers.length);
  return rows.length;
}

// ------------------------------------------------------------------------------
// 4. SYNC EXPENSES SHEET
// ------------------------------------------------------------------------------
function syncExpensesSheet(ss, expenses) {
  var sheet = getOrCreateSheet(ss, "4_Expenses", "#e11d48");
  var headers = [
    "Expense ID", "Date", "Category", "Description / বিবরণ", "Amount (৳)", "Approved By"
  ];
  styleHeaderRow(sheet, headers, "#9f1239");
  
  var rows = expenses.map(function(e) {
    return [
      e.id, e.date, e.category, e.description, e.amount || 0, e.approvedBy || "Principal"
    ];
  });
  
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    sheet.getRange(2, 5, rows.length, 1).setNumberFormat("#,##0");
  }
  sheet.autoResizeColumns(1, headers.length);
  return rows.length;
}

// ------------------------------------------------------------------------------
// 5. SYNC ACADEMIC RESULTS SHEET
// ------------------------------------------------------------------------------
function syncResultsSheet(ss, resultsList) {
  var sheet = getOrCreateSheet(ss, "5_Academic_Results", "#0284c7");
  var headers = [
    "Result ID", "Student ID", "Student Name", "Class", "Roll", "Term",
    "Bangla", "English", "Math", "GK", "Science", "Drawing",
    "Total Marks", "Average (%)", "GPA (5.00)", "Grade", "Status", "Teacher Remarks"
  ];
  styleHeaderRow(sheet, headers, "#075985");
  
  var rows = resultsList.map(function(r) {
    return [
      r.id, r.studentId, r.studentName, r.studentClass, r.rollNo, r.term || "1st Term",
      r.bangla || 0, r.english || 0, r.math || 0, r.gk || 0, r.science || 0, r.drawing || 0,
      r.totalMarks || 0, (r.averageMarks || 0).toFixed(1), (r.gpa || 0).toFixed(2),
      r.grade || "A+", r.status || "Pass", r.remarks || ""
    ];
  });
  
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
  sheet.autoResizeColumns(1, headers.length);
  return rows.length;
}

// ------------------------------------------------------------------------------
// 6. SYNC ATTENDANCE SHEET
// ------------------------------------------------------------------------------
function syncAttendanceSheet(ss, attendanceList) {
  var sheet = getOrCreateSheet(ss, "6_Attendance", "#d97706");
  var headers = [
    "Record ID", "Date", "Student ID", "Attendance Status"
  ];
  styleHeaderRow(sheet, headers, "#92400e");
  
  var rows = attendanceList.map(function(a) {
    return [a.id, a.date, a.studentId, a.status];
  });
  
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
  sheet.autoResizeColumns(1, headers.length);
  return rows.length;
}

// ------------------------------------------------------------------------------
// JSON RESPONSE BUILDERS
// ------------------------------------------------------------------------------
function responseSuccess(message, data) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    result: "success",
    message: message,
    data: data || {},
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function responseError(message) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "error",
    result: "error",
    message: message,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
`;
};
