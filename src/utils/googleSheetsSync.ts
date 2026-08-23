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
  LOCAL_STUDENTS: 'ks_students_data',
  LOCAL_FEES: 'ks_fees_data',
  LOCAL_STAFF: 'ks_staff_data',
  LOCAL_EXPENSES: 'ks_expenses_data',
  LOCAL_ATTENDANCE: 'ks_attendance_data',
  LOCAL_RESULTS: 'ks_results_data',
  LOCAL_SCHOOL: 'ks_school_info',
};

export const validateWebhookUrl = (url: string): { isValid: boolean; message: string; isSpreadsheetLink?: boolean } => {
  if (!url || !url.trim()) {
    return { isValid: false, message: 'Webhook URL দেওয়া হয়নি।' };
  }
  const clean = url.trim();
  if (clean.includes('docs.google.com/spreadsheets')) {
    return {
      isValid: false,
      isSpreadsheetLink: true,
      message: '⚠️ এটি সাধারণ গুগল শিটের ভিউ লিংক! স্বয়ংক্রিয় সিঙ্কের জন্য Extensions > Apps Script > Deploy > Web App থেকে তৈরি লিংকটি (যা https://script.google.com/.../exec দিয়ে শেষ হয়) ব্যবহার করুন।',
    };
  }
  if (!clean.startsWith('https://script.google.com/macros/s/')) {
    return {
      isValid: false,
      message: 'সঠিক Google Apps Script Web App URL দিন (https://script.google.com/macros/s/.../exec দিয়ে শুরু হতে হবে)।',
    };
  }
  if (clean.endsWith('/dev')) {
    return {
      isValid: true,
      message: '⚠️ আপনি Development (/dev) লিংক দিয়েছেন। লাইভ সিঙ্কের জন্য Deploy > New Deployment থেকে তৈরি করা (/exec) লিংক ব্যবহার করা সুপারিশকৃত।',
    };
  }
  return { isValid: true, message: 'সঠিক Webhook URL ফরম্যাট।' };
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
    const updated = [newLog, ...existing].slice(0, 30);
    localStorage.setItem(STORAGE_KEYS.SYNC_LOGS, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  } catch (e) {
    console.error('Failed to store sync log:', e);
  }
};

/**
 * Send payload to Google Apps Script Webhook with reliable cross-origin fallback
 */
export const sendToGoogleSheets = async (
  webhookUrl: string,
  payload: SyncPayload
): Promise<{ success: boolean; message: string; details?: any }> => {
  const validation = validateWebhookUrl(webhookUrl);
  if (!validation.isValid && !validation.isSpreadsheetLink) {
    throw new Error(validation.message);
  }
  if (validation.isSpreadsheetLink) {
    throw new Error(validation.message);
  }

  const cleanUrl = webhookUrl.trim();
  const payloadString = JSON.stringify(payload);

  try {
    // We send payload using text/plain in no-cors mode to ensure Google Apps Script 302 redirects
    // succeed without browser CORS preflight blocking.
    const response = await fetch(cleanUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: payloadString,
    });

    // In no-cors mode, type is 'opaque'. Response reaching here means HTTP request completed.
    return {
      success: true,
      message: 'গুগল শিটে ডেটা সফলভাবে প্রেরণ করা হয়েছে (Data pushed to Google Sheets)!',
      details: { timestamp: new Date().toISOString() },
    };
  } catch (err: any) {
    console.warn('Direct fetch attempt note:', err);

    // Fallback: Attempt form-based transport via invisible frame if supported
    try {
      if (typeof document !== 'undefined') {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = cleanUrl;
        form.target = 'hidden_sync_iframe';
        form.style.display = 'none';

        let iframe = document.getElementById('hidden_sync_iframe') as HTMLIFrameElement;
        if (!iframe) {
          iframe = document.createElement('iframe');
          iframe.id = 'hidden_sync_iframe';
          iframe.name = 'hidden_sync_iframe';
          iframe.style.display = 'none';
          document.body.appendChild(iframe);
        }

        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'data';
        input.value = payloadString;
        form.appendChild(input);

        document.body.appendChild(form);
        form.submit();
        setTimeout(() => {
          try {
            document.body.removeChild(form);
          } catch {}
        }, 1500);

        return {
          success: true,
          message: 'গুগল শিটে ব্যাকগ্রাউন্ডে ডেটা পাঠানো হয়েছে (Background Form Sync Dispatched)!',
        };
      }
    } catch (fallbackError: any) {
      console.error('Fallback sync failed:', fallbackError);
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
 * স্কুল: ${schoolName}
 * ভার্সন: 2.2 (Ultra Reliable Multi-Sheet Live Sync Engine)
 * ==============================================================================
 */

// 1. GET HANDLER (For Diagnostics & Connection Verification)
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetCount = ss.getSheets().length;
  
  if (e && e.parameter && e.parameter.action === 'ping') {
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      result: "success",
      message: "Connection verified! Connected to spreadsheet: " + ss.getName(),
      spreadsheetName: ss.getName(),
      sheetsCount: sheetCount,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Kindergarten Sync Active</title>' +
    '<style>body{font-family:system-ui,sans-serif;background:#0f172a;color:#f8fafc;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px;}' +
    '.card{background:#1e293b;border:1px solid #334155;border-radius:16px;padding:32px;max-width:540px;text-align:center;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);}' +
    'h1{color:#38bdf8;font-size:22px;margin-bottom:8px;}p{color:#94a3b8;font-size:14px;line-height:1.6;}' +
    '.badge{display:inline-block;background:#065f46;color:#34d399;padding:6px 14px;border-radius:999px;font-size:12px;font-weight:700;margin-bottom:16px;}' +
    '.details{background:#0f172a;padding:16px;border-radius:8px;text-align:left;font-size:12px;color:#cbd5e1;margin-top:20px;font-family:monospace;}' +
    '</style></head><body><div class="card">' +
    '<div class="badge">🟢 WEBHOOK ACTIVE & LISTENING</div>' +
    '<h1>Kindergarten School Management Sync Engine</h1>' +
    '<p>আপনার গুগল স্প্রেডশিটের সাথে স্কুল ম্যানেজমেন্ট সফটওয়্যারটি সফলভাবে যুক্ত রয়েছে। অ্যাপ থেকে তথ্য এন্ট্রি করলে তা স্বয়ংক্রিয়ভাবে এখানে আপডেট হবে।</p>' +
    '<div class="details"><b>Spreadsheet:</b> ' + ss.getName() + '<br><b>Sheets:</b> ' + sheetCount + '<br><b>Server Time:</b> ' + new Date().toLocaleString() + '</div>' +
    '</div></body></html>';
    
  return HtmlService.createHtmlOutput(html).setTitle("Kindergarten Sync Webhook");
}

// 2. POST HANDLER (Receives Live Data from School App)
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Wait up to 30 seconds for any other simultaneous sync to finish safely
    lock.waitLock(30000);
    
    var rawData = "";
    if (e && e.postData && e.postData.contents) {
      rawData = e.postData.contents;
    } else if (e && e.parameter && e.parameter.data) {
      rawData = e.parameter.data;
    } else if (e && e.postData && e.postData.getDataAsString) {
      rawData = e.postData.getDataAsString();
    }
    
    if (!rawData) {
      return responseError("No payload data received.");
    }
    
    var data = JSON.parse(rawData);
    var action = data.action || 'sync_all';
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var results = {};
    
    // PING ACTION
    if (action === 'ping') {
      return responseSuccess("Ping successful. Connected to: " + ss.getName(), { spreadsheetName: ss.getName() });
    }
    
    // 1. STUDENTS SYNC
    if (action === 'sync_all' || action === 'sync_students') {
      if (data.students && data.students.length >= 0) {
        results.students = syncStudentsSheet(ss, data.students);
      }
    }
    
    // 2. FEES SYNC
    if (action === 'sync_all' || action === 'sync_fees') {
      if (data.fees && data.fees.length >= 0) {
        results.fees = syncFeesSheet(ss, data.fees);
      }
    }
    
    // 3. STAFF & PAYROLL SYNC
    if (action === 'sync_all' || action === 'sync_staff') {
      if (data.staff && data.staff.length >= 0) {
        results.staff = syncStaffSheet(ss, data.staff);
      }
    }
    
    // 4. EXPENSES SYNC
    if (action === 'sync_all' || action === 'sync_expenses') {
      if (data.expenses && data.expenses.length >= 0) {
        results.expenses = syncExpensesSheet(ss, data.expenses);
      }
    }
    
    // 5. ACADEMIC RESULTS SYNC
    if (action === 'sync_all' || action === 'sync_results') {
      if (data.results && data.results.length >= 0) {
        results.results = syncResultsSheet(ss, data.results);
      }
    }
    
    // 6. ATTENDANCE SYNC
    if (action === 'sync_all' || action === 'sync_attendance') {
      if (data.attendance && data.attendance.length >= 0) {
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
// HELPER: GET OR CREATE SHEET WITH BEAUTIFUL STYLING
// ------------------------------------------------------------------------------
function getOrCreateSheet(ss, sheetName, tabColorHex) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  if (tabColorHex) {
    try { sheet.setTabColor(tabColorHex); } catch(e) {}
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
  headerRange.setVerticalAlignment("middle");
  sheet.setRowHeight(1, 32);
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
  
  if (!students || students.length === 0) return 0;
  
  var rows = students.map(function(s) {
    return [
      s.id || "", s.name || "", s.nameBn || "", s.studentClass || "Play", s.section || "Morning",
      s.rollNo || 1, s.fatherName || "", s.motherName || "", s.contactNumber || "", s.emergencyContact || "",
      s.bloodGroup || "", s.address || "", s.admissionDate || "", s.status || "Active"
    ];
  });
  
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  sheet.getRange(2, 1, rows.length, 1).setFontWeight("bold").setFontColor("#1e3a8a");
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
  
  if (!fees || fees.length === 0) return 0;
  
  var rows = fees.map(function(f) {
    return [
      f.id || "", f.studentId || "", f.studentName || "", f.studentClass || "", f.month || "",
      f.admissionFee || 0, f.monthlyTuitionFee || 0, f.examFee || 0, f.transportFee || 0, f.fineFee || 0,
      f.totalPayable || 0, f.amountPaid || 0, f.dueAmount || 0, f.paymentDate || "",
      f.paymentMethod || "Cash", f.receiptNo || "", f.paymentStatus || "Paid"
    ];
  });
  
  var dataRange = sheet.getRange(2, 1, rows.length, headers.length);
  dataRange.setValues(rows);
  sheet.getRange(2, 6, rows.length, 8).setNumberFormat("#,##0");
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
  
  if (!staffList || staffList.length === 0) return 0;
  
  var rows = staffList.map(function(st) {
    return [
      st.id || "", st.name || "", st.designation || "", st.contact || "",
      st.basicSalary || 0, st.allowances || 0, st.deductions || 0,
      st.netSalary || 0, st.paymentDate || "", st.status || "Paid"
    ];
  });
  
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  sheet.getRange(2, 5, rows.length, 4).setNumberFormat("#,##0");
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
  
  if (!expenses || expenses.length === 0) return 0;
  
  var rows = expenses.map(function(e) {
    return [
      e.id || "", e.date || "", e.category || "", e.description || "", e.amount || 0, e.approvedBy || "Principal"
    ];
  });
  
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  sheet.getRange(2, 5, rows.length, 1).setNumberFormat("#,##0");
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
  
  if (!resultsList || resultsList.length === 0) return 0;
  
  var rows = resultsList.map(function(r) {
    return [
      r.id || "", r.studentId || "", r.studentName || "", r.studentClass || "", r.rollNo || 1, r.term || "1st Term",
      r.bangla || 0, r.english || 0, r.math || 0, r.gk || 0, r.science || 0, r.drawing || 0,
      r.totalMarks || 0, (r.averageMarks || 0).toFixed(1), (r.gpa || 0).toFixed(2),
      r.grade || "A+", r.status || "Pass", r.remarks || ""
    ];
  });
  
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
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
  
  if (!attendanceList || attendanceList.length === 0) return 0;
  
  var rows = attendanceList.map(function(a) {
    return [a.id || "", a.date || "", a.studentId || "", a.status || "Present"];
  });
  
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
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

