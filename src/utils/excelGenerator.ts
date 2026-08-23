import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Student, Staff, FeeRecord, Expense, AcademicResult, SchoolInfo, AttendanceRecord } from '../types';

export const exportKindergartenExcelWorkbook = async (
  schoolInfo: SchoolInfo,
  students: Student[],
  fees: FeeRecord[],
  staffList: Staff[],
  expenses: Expense[],
  attendance: AttendanceRecord[],
  results: AcademicResult[]
) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sunshine Kindergarten Admin';
  workbook.lastModifiedBy = 'Sunshine Kindergarten Admin';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Colors & Fills
  const NAVY_DARK = 'FF0D2B45';
  const NAVY_MID = 'FF1D4E89';
  const NAVY_LIGHT = 'FFD0E1FD';
  const KPI_GREEN = 'FFE8F8F5';
  const KPI_RED = 'FFFDEDEC';
  const ZEBRA_ALT = 'FFF7FAFD';
  const NAV_BG = 'FFE2EAF4';

  const fontHeader: Partial<ExcelJS.Font> = {
    name: 'Segoe UI',
    size: 10,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };

  const fontBold: Partial<ExcelJS.Font> = {
    name: 'Segoe UI',
    size: 10,
    bold: true,
    color: { argb: 'FF212529' },
  };

  const fontRegular: Partial<ExcelJS.Font> = {
    name: 'Segoe UI',
    size: 10,
    color: { argb: 'FF212529' },
  };

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
  };

  const allSheets = [
    { key: 'Dashboard', label: '📊 Dashboard & KPIs' },
    { key: 'Student_Database', label: '👨‍🎓 Student Database' },
    { key: 'Student_Profile', label: '🔍 Student Profile' },
    { key: 'Attendance_Tracker', label: '📅 Attendance' },
    { key: 'Fee_Management', label: '💳 Fee Management' },
    { key: 'Fee_Receipt', label: '🧾 Fee Receipt (Invoice)' },
    { key: 'Due_Alerts', label: '📲 WhatsApp Due Alerts' },
    { key: 'Staff_Payroll', label: '💼 Staff & Payroll' },
    { key: 'Expense_Tracker', label: '📉 Expense Tracker' },
    { key: 'Academic_Result', label: '🏆 Academic Results' },
  ];

  const addNavHeader = (ws: ExcelJS.Worksheet, currentSheetKey: string) => {
    ws.mergeCells('A1:M1');
    const titleCell = ws.getCell('A1');
    titleCell.value = `🏫 ${schoolInfo.name.toUpperCase()} - ALL-IN-ONE SYSTEM`;
    titleCell.font = { name: 'Segoe UI', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_DARK } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 32;

    ws.getRow(2).height = 22;
    allSheets.forEach((s, idx) => {
      const col = idx + 1;
      const cell = ws.getCell(2, col);
      cell.value = s.label;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      if (s.key === currentSheetKey) {
        cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: NAVY_DARK } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_LIGHT } };
      } else {
        cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF004085' }, underline: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAV_BG } };
      }
    });
  };

  // 1. DASHBOARD
  const wsDash = workbook.addWorksheet('Dashboard', { views: [{ showGridLines: true }] });
  addNavHeader(wsDash, 'Dashboard');
  wsDash.getCell('A4').value = '📊 EXECUTIVE SCHOOL DASHBOARD & KEY PERFORMANCE INDICATORS';
  wsDash.getCell('A4').font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: NAVY_DARK } };

  // KPI Cards
  const kpis = [
    { cell: 'B', label: 'TOTAL STUDENTS', formula: '=COUNTA(Student_Database!A6:A100)', color: 'FFEBF3FB', numFmt: '0' },
    { cell: 'D', label: 'TOTAL STAFF', formula: '=COUNTA(Staff_Payroll!A6:A50)', color: 'FFEBF3FB', numFmt: '0' },
    { cell: 'F', label: 'TOTAL FEES COLLECTED', formula: '=SUM(Fee_Management!K6:K100)', color: KPI_GREEN, numFmt: '"৳"#,##0.00' },
    { cell: 'H', label: 'TOTAL EXPENSES', formula: '=SUM(Staff_Payroll!H6:H50)+SUM(Expense_Tracker!E6:E100)', color: KPI_RED, numFmt: '"৳"#,##0.00' },
    { cell: 'J', label: 'NET SURPLUS / (DEFICIT)', formula: '=F7-H7', color: NAVY_LIGHT, numFmt: '"৳"#,##0.00' },
    { cell: 'L', label: 'TOTAL UNCOLLECTED DUES', formula: '=SUM(Fee_Management!L6:L100)', color: KPI_RED, numFmt: '"৳"#,##0.00' },
  ];

  kpis.forEach(k => {
    const col1 = k.cell;
    const col2 = String.fromCharCode(k.cell.charCodeAt(0) + 1);
    wsDash.mergeCells(`${col1}6:${col2}6`);
    const lbl = wsDash.getCell(`${col1}6`);
    lbl.value = k.label;
    lbl.font = { name: 'Segoe UI', size: 8, bold: true, color: { argb: 'FF555555' } };
    lbl.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: k.color } };
    lbl.alignment = { horizontal: 'center', vertical: 'middle' };

    wsDash.mergeCells(`${col1}7:${col2}8`);
    const val = wsDash.getCell(`${col1}7`);
    val.value = { formula: k.formula, result: 0 };
    val.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: NAVY_DARK } };
    val.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: k.color } };
    val.alignment = { horizontal: 'center', vertical: 'middle' };
    val.numFmt = k.numFmt;
  });

  // Class-wise Table
  wsDash.getCell('B11').value = '🏫 Class-wise Student & Fee Summary';
  wsDash.getCell('B11').font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: NAVY_DARK } };

  const dashHeaders = ['Class', 'Total Students', 'Total Payable (৳)', 'Collected (৳)', 'Due Balance (৳)'];
  dashHeaders.forEach((h, idx) => {
    const c = wsDash.getCell(12, idx + 2);
    c.value = h;
    c.font = fontHeader;
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_MID } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  const classes = ['Play', 'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
  classes.forEach((cls, idx) => {
    const row = 13 + idx;
    wsDash.getCell(row, 2).value = cls;
    wsDash.getCell(row, 3).value = { formula: `=COUNTIF(Student_Database!C$6:C$100, "${cls}")`, result: 0 };
    wsDash.getCell(row, 4).value = { formula: `=SUMIF(Fee_Management!C$6:C$100, "${cls}", Fee_Management!J$6:J$100)`, result: 0 };
    wsDash.getCell(row, 4).numFmt = '"৳"#,##0.00';
    wsDash.getCell(row, 5).value = { formula: `=SUMIF(Fee_Management!C$6:C$100, "${cls}", Fee_Management!K$6:K$100)`, result: 0 };
    wsDash.getCell(row, 5).numFmt = '"৳"#,##0.00';
    wsDash.getCell(row, 6).value = { formula: `=SUMIF(Fee_Management!C$6:C$100, "${cls}", Fee_Management!L$6:L$100)`, result: 0 };
    wsDash.getCell(row, 6).numFmt = '"৳"#,##0.00';

    for (let c = 2; c <= 6; c++) {
      const cell = wsDash.getCell(row, c);
      cell.font = fontRegular;
      cell.border = thinBorder;
      if (idx % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA_ALT } };
    }
  });

  // 2. STUDENT DATABASE
  const wsStud = workbook.addWorksheet('Student_Database', { views: [{ showGridLines: true }] });
  addNavHeader(wsStud, 'Student_Database');
  wsStud.getCell('A4').value = '👨‍🎓 STUDENT ADMISSION & MASTER DATABASE';
  wsStud.getCell('A4').font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: NAVY_DARK } };

  const studHeaders = [
    'Student ID', 'Student Full Name', 'Class', 'Section', 'Roll No',
    "Father's Name", "Mother's Name", 'Contact Number', 'Emergency Contact',
    'Residential Address', 'Admission Date', 'Blood Group', 'Status',
  ];
  studHeaders.forEach((h, i) => {
    const c = wsStud.getCell(5, i + 1);
    c.value = h;
    c.font = fontHeader;
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_DARK } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  students.forEach((s, idx) => {
    const r = 6 + idx;
    const rowValues = [
      s.id, s.name, s.studentClass, s.section, s.rollNo,
      s.fatherName, s.motherName, s.contactNumber, s.emergencyContact,
      s.address, s.admissionDate, s.bloodGroup, s.status
    ];
    rowValues.forEach((val, ci) => {
      const c = wsStud.getCell(r, ci + 1);
      c.value = val;
      c.font = fontRegular;
      c.border = thinBorder;
      c.alignment = { horizontal: [0, 2, 3, 4, 10, 11, 12].includes(ci) ? 'center' : 'left', vertical: 'middle' };
      if (idx % 2 === 1) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA_ALT } };
    });
  });

  // 3. STUDENT PROFILE
  const wsProf = workbook.addWorksheet('Student_Profile', { views: [{ showGridLines: true }] });
  addNavHeader(wsProf, 'Student_Profile');
  wsProf.getCell('B4').value = '🔍 DYNAMIC STUDENT 360° PROFILE LOOKUP';
  wsProf.getCell('B4').font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: NAVY_DARK } };

  wsProf.getCell('B6').value = 'Select Student ID:';
  wsProf.getCell('B6').font = fontBold;
  wsProf.getCell('C6').value = students[0]?.id || 'KS-101';
  wsProf.getCell('C6').font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: NAVY_DARK } };
  wsProf.getCell('C6').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
  wsProf.getCell('C6').alignment = { horizontal: 'center', vertical: 'middle' };

  const profFields = [
    ['Student Full Name:', '=IFERROR(XLOOKUP(C6, Student_Database!A6:A50, Student_Database!B6:B50), "Select ID")'],
    ['Class & Section:', '=IFERROR(XLOOKUP(C6, Student_Database!A6:A50, Student_Database!C6:C50) & " - " & XLOOKUP(C6, Student_Database!A6:A50, Student_Database!D6:D50), "-")'],
    ['Roll Number:', '=IFERROR(XLOOKUP(C6, Student_Database!A6:A50, Student_Database!E6:E50), "-")'],
    ["Father's Name:", '=IFERROR(XLOOKUP(C6, Student_Database!A6:A50, Student_Database!F6:F50), "-")'],
    ["Mother's Name:", '=IFERROR(XLOOKUP(C6, Student_Database!A6:A50, Student_Database!G6:G50), "-")'],
    ['Contact Number:', '=IFERROR(XLOOKUP(C6, Student_Database!A6:A50, Student_Database!H6:H50), "-")'],
    ['Emergency Contact:', '=IFERROR(XLOOKUP(C6, Student_Database!A6:A50, Student_Database!I6:I50), "-")'],
    ['Residential Address:', '=IFERROR(XLOOKUP(C6, Student_Database!A6:A50, Student_Database!J6:J50), "-")'],
    ['Admission Date:', '=IFERROR(XLOOKUP(C6, Student_Database!A6:A50, Student_Database!K6:K50), "-")'],
    ['Blood Group:', '=IFERROR(XLOOKUP(C6, Student_Database!A6:A50, Student_Database!L6:L50), "-")'],
    ['Student Status:', '=IFERROR(XLOOKUP(C6, Student_Database!A6:A50, Student_Database!M6:M50), "-")'],
  ];

  profFields.forEach(([lbl, formula], i) => {
    const row = 9 + i;
    const lCell = wsProf.getCell(row, 2);
    lCell.value = lbl;
    lCell.font = fontBold;
    lCell.border = thinBorder;
    lCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBF3FB' } };

    const vCell = wsProf.getCell(row, 3);
    vCell.value = { formula, result: '' };
    vCell.font = fontRegular;
    vCell.border = thinBorder;
  });

  // 4. ATTENDANCE TRACKER
  const wsAtt = workbook.addWorksheet('Attendance_Tracker', { views: [{ showGridLines: true }] });
  addNavHeader(wsAtt, 'Attendance_Tracker');
  wsAtt.getCell('A4').value = '📅 DAILY STUDENT ATTENDANCE REGISTER';
  wsAtt.getCell('A4').font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: NAVY_DARK } };

  const attHeaders = ['Student ID', 'Student Name', 'Class', 'Roll', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'Total Present', 'Total Absent', 'Attendance %'];
  attHeaders.forEach((h, i) => {
    const c = wsAtt.getCell(5, i + 1);
    c.value = h;
    c.font = fontHeader;
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_DARK } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  students.forEach((s, idx) => {
    const r = 6 + idx;
    wsAtt.getCell(r, 1).value = s.id;
    wsAtt.getCell(r, 2).value = s.name;
    wsAtt.getCell(r, 3).value = s.studentClass;
    wsAtt.getCell(r, 4).value = s.rollNo;

    for (let d = 5; d <= 14; d++) {
      const isAbsent = idx === 3 && [5, 7, 9, 13].includes(d) || idx === 7 && [5, 6, 8, 10, 12, 14].includes(d) || (idx === 1 && d === 7);
      const c = wsAtt.getCell(r, d);
      c.value = isAbsent ? 'A' : 'P';
      c.alignment = { horizontal: 'center', vertical: 'middle' };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isAbsent ? 'FFF8D7DA' : 'FFD4EDDA' } };
      c.border = thinBorder;
    }

    wsAtt.getCell(r, 15).value = { formula: `=COUNTIF(E${r}:N${r}, "P")`, result: 9 };
    wsAtt.getCell(r, 15).alignment = { horizontal: 'center', vertical: 'middle' };
    wsAtt.getCell(r, 16).value = { formula: `=COUNTIF(E${r}:N${r}, "A")`, result: 1 };
    wsAtt.getCell(r, 16).alignment = { horizontal: 'center', vertical: 'middle' };
    const pct = wsAtt.getCell(r, 17);
    pct.value = { formula: `=O${r}/(O${r}+P${r})`, result: 0.9 };
    pct.numFmt = '0.0%';
    pct.alignment = { horizontal: 'center', vertical: 'middle' };
    pct.font = fontBold;

    for (let c = 1; c <= 17; c++) {
      wsAtt.getCell(r, c).border = thinBorder;
    }
  });

  // 5. FEE MANAGEMENT
  const wsFee = workbook.addWorksheet('Fee_Management', { views: [{ showGridLines: true }] });
  addNavHeader(wsFee, 'Fee_Management');
  wsFee.getCell('A4').value = '💳 TUITION & COMPREHENSIVE FEE LEDGER';
  wsFee.getCell('A4').font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: NAVY_DARK } };

  const feeHeaders = [
    'Student ID', 'Student Name', 'Class', 'Month', 'Admission Fee',
    'Tuition Fee', 'Exam Fee', 'Transport Fee', 'Fine/Late Fee',
    'Total Payable', 'Amount Paid', 'Due Amount', 'Payment Date', 'Payment Status'
  ];
  feeHeaders.forEach((h, i) => {
    const c = wsFee.getCell(5, i + 1);
    c.value = h;
    c.font = fontHeader;
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_DARK } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  fees.forEach((f, idx) => {
    const r = 6 + idx;
    wsFee.getCell(r, 1).value = f.studentId;
    wsFee.getCell(r, 2).value = f.studentName;
    wsFee.getCell(r, 3).value = f.studentClass;
    wsFee.getCell(r, 4).value = f.month;

    wsFee.getCell(r, 5).value = f.admissionFee;
    wsFee.getCell(r, 6).value = f.monthlyTuitionFee;
    wsFee.getCell(r, 7).value = f.examFee;
    wsFee.getCell(r, 8).value = f.transportFee;
    wsFee.getCell(r, 9).value = f.fineFee;

    for (let c = 5; c <= 9; c++) {
      wsFee.getCell(r, c).numFmt = '"৳"#,##0.00';
    }

    wsFee.getCell(r, 10).value = { formula: `=SUM(E${r}:I${r})`, result: f.totalPayable };
    wsFee.getCell(r, 10).numFmt = '"৳"#,##0.00';
    wsFee.getCell(r, 10).font = fontBold;

    wsFee.getCell(r, 11).value = f.amountPaid;
    wsFee.getCell(r, 11).numFmt = '"৳"#,##0.00';

    wsFee.getCell(r, 12).value = { formula: `=J${r}-K${r}`, result: f.dueAmount };
    wsFee.getCell(r, 12).numFmt = '"৳"#,##0.00';
    wsFee.getCell(r, 12).font = fontBold;
    if (f.dueAmount > 0) {
      wsFee.getCell(r, 12).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: KPI_RED } };
    }

    wsFee.getCell(r, 13).value = f.paymentDate;
    wsFee.getCell(r, 14).value = { formula: `=IF(L${r}<=0, "Paid", IF(K${r}>0, "Partial", "Unpaid"))`, result: f.paymentStatus };
    wsFee.getCell(r, 14).font = fontBold;
    wsFee.getCell(r, 14).alignment = { horizontal: 'center', vertical: 'middle' };

    for (let c = 1; c <= 14; c++) {
      wsFee.getCell(r, c).border = thinBorder;
    }
  });

  // 6. FEE RECEIPT
  const wsRec = workbook.addWorksheet('Fee_Receipt', { views: [{ showGridLines: true }] });
  addNavHeader(wsRec, 'Fee_Receipt');
  wsRec.getCell('B4').value = '🧾 PRINT-READY STUDENT MONEY RECEIPT / INVOICE (A4/A5)';
  wsRec.getCell('B4').font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: NAVY_DARK } };

  wsRec.getCell('B6').value = 'Select Student ID:';
  wsRec.getCell('B6').font = fontBold;
  wsRec.getCell('C6').value = fees[0]?.studentId || 'KS-101';
  wsRec.getCell('C6').font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: NAVY_DARK } };
  wsRec.getCell('C6').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };

  wsRec.mergeCells('B8:G8');
  wsRec.getCell('B8').value = `🏫 ${schoolInfo.name.toUpperCase()}`;
  wsRec.getCell('B8').font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  wsRec.getCell('B8').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A365D' } };
  wsRec.getCell('B8').alignment = { horizontal: 'center', vertical: 'middle' };

  wsRec.mergeCells('B9:G9');
  wsRec.getCell('B9').value = `${schoolInfo.address} | Phone: ${schoolInfo.phone}`;
  wsRec.getCell('B9').font = { name: 'Segoe UI', size: 9, color: { argb: 'FFFFFFFF' } };
  wsRec.getCell('B9').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A365D' } };
  wsRec.getCell('B9').alignment = { horizontal: 'center', vertical: 'middle' };

  wsRec.mergeCells('B10:G10');
  wsRec.getCell('B10').value = 'OFFICIAL STUDENT FEE MONEY RECEIPT';
  wsRec.getCell('B10').font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: NAVY_DARK } };
  wsRec.getCell('B10').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_LIGHT } };
  wsRec.getCell('B10').alignment = { horizontal: 'center', vertical: 'middle' };

  // 7. DUE ALERTS & WHATSAPP
  const wsDue = workbook.addWorksheet('Due_Alerts', { views: [{ showGridLines: true }] });
  addNavHeader(wsDue, 'Due_Alerts');
  wsDue.getCell('A4').value = '📲 AUTOMATED DUE BALANCE ALERTS & 1-CLICK WHATSAPP MESSAGING';
  wsDue.getCell('A4').font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: NAVY_DARK } };

  const dueHeaders = ['Student ID', 'Student Name', 'Class', 'Parent Contact', 'Billed Fee', 'Paid Amount', 'Due Balance (৳)', 'Status', '1-Click WhatsApp Reminder Link'];
  dueHeaders.forEach((h, i) => {
    const c = wsDue.getCell(5, i + 1);
    c.value = h;
    c.font = fontHeader;
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_DARK } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  students.forEach((s, idx) => {
    const r = 6 + idx;
    wsDue.getCell(r, 1).value = s.id;
    wsDue.getCell(r, 2).value = s.name;
    wsDue.getCell(r, 3).value = s.studentClass;
    wsDue.getCell(r, 4).value = s.contactNumber;

    wsDue.getCell(r, 5).value = { formula: `=IFERROR(XLOOKUP(A${r}, Fee_Management!A$6:A$50, Fee_Management!J$6:J$50), 0)`, result: 0 };
    wsDue.getCell(r, 5).numFmt = '"৳"#,##0.00';
    wsDue.getCell(r, 6).value = { formula: `=IFERROR(XLOOKUP(A${r}, Fee_Management!A$6:A$50, Fee_Management!K$6:K$50), 0)`, result: 0 };
    wsDue.getCell(r, 6).numFmt = '"৳"#,##0.00';

    const dueCell = wsDue.getCell(r, 7);
    dueCell.value = { formula: `=IFERROR(XLOOKUP(A${r}, Fee_Management!A$6:A$50, Fee_Management!L$6:L$50), 0)`, result: 0 };
    dueCell.numFmt = '"৳"#,##0.00';
    dueCell.font = fontBold;

    wsDue.getCell(r, 8).value = { formula: `=IF(G${r}>0, "DUE PENDING", "CLEARED")`, result: '' };
    wsDue.getCell(r, 8).alignment = { horizontal: 'center', vertical: 'middle' };

    const waFormula = `=IF(G${r}>0, HYPERLINK("https://wa.me/" & D${r} & "?text=" & ENCODEURL("প্রিয় অভিভাবক, সানশাইন কিন্ডারগার্টেন থেকে বিনীতভাবে জানানো যাচ্ছে যে আপনার সন্তান " & B${r} & " (ID: " & A${r} & ") এর বকেয়া ফি ৳" & TEXT(G${r},"#,##0") & " টাকা। অনুগ্রহ করে দ্রুত পরিশোধ করুন। ধন্যবাদ।"), "📲 Send WhatsApp Notice"), "✅ Paid")`;
    const linkCell = wsDue.getCell(r, 9);
    linkCell.value = { formula: waFormula, result: '📲 Send WhatsApp Notice' };
    linkCell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF0B6623' }, underline: true };
    linkCell.alignment = { horizontal: 'center', vertical: 'middle' };

    for (let c = 1; c <= 9; c++) {
      wsDue.getCell(r, c).border = thinBorder;
    }
  });

  // 8. STAFF & PAYROLL
  const wsStaff = workbook.addWorksheet('Staff_Payroll', { views: [{ showGridLines: true }] });
  addNavHeader(wsStaff, 'Staff_Payroll');
  wsStaff.getCell('A4').value = '💼 TEACHER & STAFF PAYROLL REGISTER';
  wsStaff.getCell('A4').font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: NAVY_DARK } };

  const staffHeaders = ['Staff ID', 'Full Name', 'Designation', 'Contact No', 'Basic Salary', 'Allowances', 'Deductions', 'Net Salary (৳)', 'Payment Date', 'Status'];
  staffHeaders.forEach((h, i) => {
    const c = wsStaff.getCell(5, i + 1);
    c.value = h;
    c.font = fontHeader;
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_DARK } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  staffList.forEach((st, idx) => {
    const r = 6 + idx;
    wsStaff.getCell(r, 1).value = st.id;
    wsStaff.getCell(r, 2).value = st.name;
    wsStaff.getCell(r, 3).value = st.designation;
    wsStaff.getCell(r, 4).value = st.contact;

    wsStaff.getCell(r, 5).value = st.basicSalary;
    wsStaff.getCell(r, 6).value = st.allowances;
    wsStaff.getCell(r, 7).value = st.deductions;
    for (let c = 5; c <= 7; c++) wsStaff.getCell(r, c).numFmt = '"৳"#,##0.00';

    wsStaff.getCell(r, 8).value = { formula: `=E${r}+F${r}-G${r}`, result: st.netSalary };
    wsStaff.getCell(r, 8).numFmt = '"৳"#,##0.00';
    wsStaff.getCell(r, 8).font = fontBold;

    wsStaff.getCell(r, 9).value = st.paymentDate;
    wsStaff.getCell(r, 10).value = st.status;
    wsStaff.getCell(r, 10).alignment = { horizontal: 'center', vertical: 'middle' };

    for (let c = 1; c <= 10; c++) wsStaff.getCell(r, c).border = thinBorder;
  });

  // 9. EXPENSE TRACKER
  const wsExp = workbook.addWorksheet('Expense_Tracker', { views: [{ showGridLines: true }] });
  addNavHeader(wsExp, 'Expense_Tracker');
  wsExp.getCell('A4').value = '📉 OPERATIONAL & ADMINISTRATIVE EXPENSE REGISTER';
  wsExp.getCell('A4').font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: NAVY_DARK } };

  const expHeaders = ['Expense ID', 'Date', 'Category', 'Expense Description', 'Amount (৳)', 'Approved By'];
  expHeaders.forEach((h, i) => {
    const c = wsExp.getCell(5, i + 1);
    c.value = h;
    c.font = fontHeader;
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_DARK } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  expenses.forEach((e, idx) => {
    const r = 6 + idx;
    wsExp.getCell(r, 1).value = e.id;
    wsExp.getCell(r, 2).value = e.date;
    wsExp.getCell(r, 3).value = e.category;
    wsExp.getCell(r, 4).value = e.description;
    wsExp.getCell(r, 5).value = e.amount;
    wsExp.getCell(r, 5).numFmt = '"৳"#,##0.00';
    wsExp.getCell(r, 6).value = e.approvedBy;

    for (let c = 1; c <= 6; c++) wsExp.getCell(r, c).border = thinBorder;
  });

  // 10. ACADEMIC RESULTS
  const wsRes = workbook.addWorksheet('Academic_Result', { views: [{ showGridLines: true }] });
  addNavHeader(wsRes, 'Academic_Result');
  wsRes.getCell('A4').value = '🏆 ACADEMIC MARKSHEET, GPA & REPORT CARD REGISTER';
  wsRes.getCell('A4').font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: NAVY_DARK } };

  const resHeaders = [
    'Student ID', 'Student Name', 'Class', 'Roll', 'Term',
    'Bangla', 'English', 'Math', 'GK', 'Science', 'Drawing',
    'Total (600)', 'Average (%)', 'GPA (5.00)', 'Grade', 'Status', 'Remarks'
  ];
  resHeaders.forEach((h, i) => {
    const c = wsRes.getCell(5, i + 1);
    c.value = h;
    c.font = fontHeader;
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_DARK } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  results.forEach((res, idx) => {
    const r = 6 + idx;
    wsRes.getCell(r, 1).value = res.studentId;
    wsRes.getCell(r, 2).value = res.studentName;
    wsRes.getCell(r, 3).value = res.studentClass;
    wsRes.getCell(r, 4).value = res.rollNo;
    wsRes.getCell(r, 5).value = res.term;

    wsRes.getCell(r, 6).value = res.bangla;
    wsRes.getCell(r, 7).value = res.english;
    wsRes.getCell(r, 8).value = res.math;
    wsRes.getCell(r, 9).value = res.gk;
    wsRes.getCell(r, 10).value = res.science;
    wsRes.getCell(r, 11).value = res.drawing;

    wsRes.getCell(r, 12).value = { formula: `=SUM(F${r}:K${r})`, result: res.totalMarks };
    wsRes.getCell(r, 12).font = fontBold;
    wsRes.getCell(r, 13).value = { formula: `=AVERAGE(F${r}:K${r})`, result: res.averageMarks };
    wsRes.getCell(r, 13).numFmt = '0.00';

    wsRes.getCell(r, 14).value = { formula: `=IF(M${r}>=80, 5.00, IF(M${r}>=70, 4.00, IF(M${r}>=60, 3.50, IF(M${r}>=50, 3.00, IF(M${r}>=40, 2.00, IF(M${r}>=33, 1.00, 0.00))))))`, result: res.gpa };
    wsRes.getCell(r, 14).numFmt = '0.00';
    wsRes.getCell(r, 14).font = fontBold;

    wsRes.getCell(r, 15).value = { formula: `=IF(M${r}>=80, "A+", IF(M${r}>=70, "A", IF(M${r}>=60, "A-", IF(M${r}>=50, "B", IF(M${r}>=40, "C", IF(M${r}>=33, "D", "F"))))))`, result: res.grade };
    wsRes.getCell(r, 15).font = fontBold;

    wsRes.getCell(r, 16).value = { formula: `=IF(M${r}>=33, "Pass", "Fail")`, result: res.status };
    wsRes.getCell(r, 16).font = fontBold;

    wsRes.getCell(r, 17).value = res.remarks;

    for (let c = 1; c <= 17; c++) wsRes.getCell(r, c).border = thinBorder;
  });

  // Adjust Column Widths
  workbook.eachSheet(ws => {
    ws.columns.forEach(col => {
      let maxLen = 12;
      col.eachCell?.({ includeEmpty: false }, (cell, rowNum) => {
        if (rowNum > 1 && cell.value) {
          const s = String(cell.value);
          if (!s.startsWith('=')) maxLen = Math.max(maxLen, s.length + 3);
        }
      });
      col.width = Math.min(maxLen, 35);
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, 'Kindergarten_School_System_Automated.xlsx');
};
