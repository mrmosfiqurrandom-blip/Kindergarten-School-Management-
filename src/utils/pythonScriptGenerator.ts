export const generatePythonScriptCode = (_schoolInfo?: any): string => {
  return `"""
================================================================================
KINDERGARTEN SCHOOL MANAGEMENT & AUTOMATED EXCEL WORKBOOK GENERATOR
Developed with Python & openpyxl
Author: Senior Excel VBA & Python Automation Engineer
Features: 10 Comprehensive Sheets, Live Excel Formulas, Conditional Formatting,
          Data Validation Dropdowns, WhatsApp Dues Messaging Links,
          Dynamic Profile & Receipt Lookups, and Unified Navigation Bar.
================================================================================
"""

import sys
import os
try:
    import openpyxl
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
    from openpyxl.utils import get_column_letter
    from openpyxl.worksheet.datavalidation import DataValidation
    from openpyxl.formatting.rule import CellIsRule
    from openpyxl.chart import BarChart, Reference, PieChart
except ImportError:
    print("Error: 'openpyxl' library is required. Please install it using: pip install openpyxl")
    sys.exit(1)


def create_school_management_workbook(output_filename="Kindergarten_School_System.xlsx"):
    print("🚀 Initializing Kindergarten School Excel Workbook Generation...")
    wb = openpyxl.Workbook()
    # Remove default sheet
    default_sheet = wb.active
    wb.remove(default_sheet)

    # -------------------------------------------------------------
    # STYLES & COLOR PALETTE
    # -------------------------------------------------------------
    NAVY_DARK = "0D2B45"      # Primary Header Dark Navy
    NAVY_MID = "1D4E89"       # Subheader Mid Navy
    NAVY_LIGHT = "D0E1FD"     # Accent Ice Blue
    GOLD_ACCENT = "F4A261"    # Warning/Highlight Gold
    GREEN_SUCCESS = "2A9D8F"  # Success/Paid Emerald
    RED_ALERT = "E76F51"      # Alert/Due Coral Red
    WHITE = "FFFFFF"
    GRAY_LIGHT = "F8F9FA"
    GRAY_BORDER = "CCCCCC"
    GRAY_HEADER = "E9ECEF"

    # Fonts
    font_super_title = Font(name="Segoe UI", size=16, bold=True, color=WHITE)
    font_sheet_title = Font(name="Segoe UI", size=14, bold=True, color=NAVY_DARK)
    font_section_header = Font(name="Segoe UI", size=11, bold=True, color=WHITE)
    font_table_header = Font(name="Segoe UI", size=10, bold=True, color=WHITE)
    font_bold = Font(name="Segoe UI", size=10, bold=True, color="212529")
    font_regular = Font(name="Segoe UI", size=10, color="212529")
    font_kpi_value = Font(name="Segoe UI", size=18, bold=True, color=NAVY_DARK)
    font_kpi_label = Font(name="Segoe UI", size=9, bold=True, color="555555")
    font_nav = Font(name="Segoe UI", size=9, bold=True, color="004085", underline="single")
    font_due_link = Font(name="Segoe UI", size=10, bold=True, color="0B6623", underline="single")

    # Fills
    fill_navy_dark = PatternFill(start_color=NAVY_DARK, end_color=NAVY_DARK, fill_type="solid")
    fill_navy_mid = PatternFill(start_color=NAVY_MID, end_color=NAVY_MID, fill_type="solid")
    fill_navy_light = PatternFill(start_color=NAVY_LIGHT, end_color=NAVY_LIGHT, fill_type="solid")
    fill_kpi_card = PatternFill(start_color="EBF3FB", end_color="EBF3FB", fill_type="solid")
    fill_kpi_green = PatternFill(start_color="E8F8F5", end_color="E8F8F5", fill_type="solid")
    fill_kpi_red = PatternFill(start_color="FDEDEC", end_color="FDEDEC", fill_type="solid")
    fill_zebra_alt = PatternFill(start_color="F7FAFD", end_color="F7FAFD", fill_type="solid")
    fill_nav_bar = PatternFill(start_color="E2EAF4", end_color="E2EAF4", fill_type="solid")
    fill_receipt_hdr = PatternFill(start_color="1A365D", end_color="1A365D", fill_type="solid")

    # Alignments
    align_center = Alignment(horizontal="center", vertical="center")
    align_left = Alignment(horizontal="left", vertical="center")
    align_right = Alignment(horizontal="right", vertical="center")
    align_title = Alignment(horizontal="center", vertical="center", wrap_text=True)

    # Borders
    thin_gray = Side(style="thin", color=GRAY_BORDER)
    medium_navy = Side(style="medium", color=NAVY_MID)
    border_cell = Border(left=thin_gray, right=thin_gray, top=thin_gray, bottom=thin_gray)
    border_header = Border(left=thin_gray, right=thin_gray, top=medium_navy, bottom=medium_navy)
    border_card = Border(left=medium_navy, right=medium_navy, top=medium_navy, bottom=medium_navy)

    # Sheet list for Navigation
    ALL_SHEETS = [
        ("Dashboard", "📊 Dashboard & KPIs"),
        ("Student_Database", "👨‍🎓 Student Database"),
        ("Student_Profile", "🔍 Student Profile"),
        ("Attendance_Tracker", "📅 Attendance"),
        ("Fee_Management", "💳 Fee Management"),
        ("Fee_Receipt", "🧾 Fee Receipt (Invoice)"),
        ("Due_Alerts", "📲 WhatsApp Due Alerts"),
        ("Staff_Payroll", "💼 Staff & Payroll"),
        ("Expense_Tracker", "📉 Expense Tracker"),
        ("Academic_Result", "🏆 Academic Results")
    ]

    def add_navigation_bar(ws, current_sheet_name):
        """Adds a top navigation bar with clickable hyperlinks to jump between sheets."""
        ws.merge_cells("A1:M1")
        title_cell = ws["A1"]
        title_cell.value = "🏫 SUNSHINE KINDERGARTEN & JUNIOR ACADEMY - ALL-IN-ONE MANAGEMENT SYSTEM"
        title_cell.font = font_super_title
        title_cell.fill = fill_navy_dark
        title_cell.alignment = align_center
        ws.row_dimensions[1].height = 30

        # Nav row
        ws.row_dimensions[2].height = 22
        col_idx = 1
        for sheet_key, sheet_label in ALL_SHEETS:
            cell = ws.cell(row=2, column=col_idx)
            cell.value = sheet_label
            cell.fill = fill_nav_bar
            cell.alignment = align_center
            if sheet_key == current_sheet_name:
                cell.font = Font(name="Segoe UI", size=9, bold=True, color=NAVY_DARK)
                cell.fill = fill_navy_light
            else:
                cell.font = font_nav
                cell.hyperlink = f"#'{sheet_key}'!A1"
            col_idx += 1

    # =========================================================================
    # 1. SHEET: DASHBOARD & KPIS
    # =========================================================================
    print("  -> Creating Sheet 1: Dashboard & KPIs...")
    ws_dash = wb.create_sheet(title="Dashboard")
    ws_dash.views.sheetView[0].showGridLines = True
    add_navigation_bar(ws_dash, "Dashboard")

    # Title & Info
    ws_dash["A4"] = "📊 EXECUTIVE SCHOOL DASHBOARD & KEY PERFORMANCE INDICATORS (KPIs)"
    ws_dash["A4"].font = font_sheet_title
    ws_dash.row_dimensions[4].height = 25

    # KPI 1: Total Students
    ws_dash.merge_cells("B6:C6")
    ws_dash["B6"] = "TOTAL STUDENTS"
    ws_dash["B6"].font = font_kpi_label
    ws_dash["B6"].fill = fill_kpi_card
    ws_dash["B6"].alignment = align_center
    ws_dash.merge_cells("B7:C8")
    ws_dash["B7"] = "=COUNTA(Student_Database!A5:A50)"
    ws_dash["B7"].font = font_kpi_value
    ws_dash["B7"].fill = fill_kpi_card
    ws_dash["B7"].alignment = align_center

    # KPI 2: Total Staff
    ws_dash.merge_cells("D6:E6")
    ws_dash["D6"] = "TOTAL EMPLOYEES / STAFF"
    ws_dash["D6"].font = font_kpi_label
    ws_dash["D6"].fill = fill_kpi_card
    ws_dash["D6"].alignment = align_center
    ws_dash.merge_cells("D7:E8")
    ws_dash["D7"] = "=COUNTA(Staff_Payroll!A5:A30)"
    ws_dash["D7"].font = font_kpi_value
    ws_dash["D7"].fill = fill_kpi_card
    ws_dash["D7"].alignment = align_center

    # KPI 3: Total Income (Fee Collected)
    ws_dash.merge_cells("F6:G6")
    ws_dash["F6"] = "TOTAL FEES COLLECTED (আয়)"
    ws_dash["F6"].font = font_kpi_label
    ws_dash["F6"].fill = fill_kpi_green
    ws_dash["F6"].alignment = align_center
    ws_dash.merge_cells("F7:G8")
    ws_dash["F7"] = "=SUM(Fee_Management!K5:K50)"
    ws_dash["F7"].font = font_kpi_value
    ws_dash["F7"].fill = fill_kpi_green
    ws_dash["F7"].alignment = align_center
    ws_dash["F7"].number_format = '"৳"#,##0.00'

    # KPI 4: Total Expenses (Payroll + Ops)
    ws_dash.merge_cells("H6:I6")
    ws_dash["H6"] = "TOTAL EXPENSES (মোট ব্যয়)"
    ws_dash["H6"].font = font_kpi_label
    ws_dash["H6"].fill = fill_kpi_red
    ws_dash["H6"].alignment = align_center
    ws_dash.merge_cells("H7:I8")
    ws_dash["H7"] = "=SUM(Staff_Payroll!H5:H30)+SUM(Expense_Tracker!D5:D50)"
    ws_dash["H7"].font = font_kpi_value
    ws_dash["H7"].fill = fill_kpi_red
    ws_dash["H7"].alignment = align_center
    ws_dash["H7"].number_format = '"৳"#,##0.00'

    # KPI 5: Net Profit / Balance
    ws_dash.merge_cells("J6:K6")
    ws_dash["J6"] = "NET SURPLUS / (DEFICIT)"
    ws_dash["J6"].font = font_kpi_label
    ws_dash["J6"].fill = fill_navy_light
    ws_dash["J6"].alignment = align_center
    ws_dash.merge_cells("J7:K8")
    ws_dash["J7"] = "=F7-H7"
    ws_dash["J7"].font = font_kpi_value
    ws_dash["J7"].fill = fill_navy_light
    ws_dash["J7"].alignment = align_center
    ws_dash["J7"].number_format = '"৳"#,##0.00'

    # KPI 6: Total Dues
    ws_dash.merge_cells("L6:M6")
    ws_dash["L6"] = "TOTAL UNCOLLECTED DUES"
    ws_dash["L6"].font = font_kpi_label
    ws_dash["L6"].fill = fill_kpi_red
    ws_dash["L6"].alignment = align_center
    ws_dash.merge_cells("L7:M8")
    ws_dash["L7"] = "=SUM(Fee_Management!L5:L50)"
    ws_dash["L7"].font = font_kpi_value
    ws_dash["L7"].fill = fill_kpi_red
    ws_dash["L7"].alignment = align_center
    ws_dash["L7"].number_format = '"৳"#,##0.00'

    # Class-wise Summary Table
    ws_dash["B11"] = "🏫 Class-wise Student & Fee Summary"
    ws_dash["B11"].font = Font(name="Segoe UI", size=11, bold=True, color=NAVY_DARK)

    dash_headers = ["Class", "Total Students", "Total Payable (৳)", "Collected (৳)", "Due Balance (৳)"]
    for col_idx, h in enumerate(dash_headers, start=2):
        c = ws_dash.cell(row=12, column=col_idx, value=h)
        c.font = font_table_header
        c.fill = fill_navy_mid
        c.alignment = align_center
        c.border = border_header

    classes = ["Play", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"]
    for idx, cls_name in enumerate(classes, start=13):
        ws_dash.cell(row=idx, column=2, value=cls_name).alignment = align_center
        ws_dash.cell(row=idx, column=3, value=f'=COUNTIF(Student_Database!C$5:C$50, "{cls_name}")').alignment = align_center
        ws_dash.cell(row=idx, column=4, value=f'=SUMIF(Fee_Management!C$5:C$50, "{cls_name}", Fee_Management!J$5:J$50)').number_format = '"৳"#,##0.00'
        ws_dash.cell(row=idx, column=5, value=f'=SUMIF(Fee_Management!C$5:C$50, "{cls_name}", Fee_Management!K$5:K$50)').number_format = '"৳"#,##0.00'
        ws_dash.cell(row=idx, column=6, value=f'=SUMIF(Fee_Management!C$5:C$50, "{cls_name}", Fee_Management!L$5:L$50)').number_format = '"৳"#,##0.00'
        for col_idx in range(2, 7):
            cell = ws_dash.cell(row=idx, column=col_idx)
            cell.font = font_regular
            cell.border = border_cell
            if idx % 2 == 0:
                cell.fill = fill_zebra_alt

    # Total Row for Dashboard Table
    tot_row = 13 + len(classes)
    ws_dash.cell(row=tot_row, column=2, value="Grand Total").font = font_bold
    ws_dash.cell(row=tot_row, column=3, value=f"=SUM(C13:C{tot_row-1})").font = font_bold
    ws_dash.cell(row=tot_row, column=4, value=f"=SUM(D13:D{tot_row-1})").font = font_bold
    ws_dash.cell(row=tot_row, column=4).number_format = '"৳"#,##0.00'
    ws_dash.cell(row=tot_row, column=5, value=f"=SUM(E13:E{tot_row-1})").font = font_bold
    ws_dash.cell(row=tot_row, column=5).number_format = '"৳"#,##0.00'
    ws_dash.cell(row=tot_row, column=6, value=f"=SUM(F13:F{tot_row-1})").font = font_bold
    ws_dash.cell(row=tot_row, column=6).number_format = '"৳"#,##0.00'
    for col_idx in range(2, 7):
        c = ws_dash.cell(row=tot_row, column=col_idx)
        c.fill = fill_navy_light
        c.border = border_header

    # Add Chart to Dashboard
    chart = BarChart()
    chart.type = "col"
    chart.style = 10
    chart.title = "Fee Collection vs Due by Class"
    chart.y_axis.title = "Amount in BDT (৳)"
    chart.x_axis.title = "Class"
    data = Reference(ws_dash, min_col=5, min_row=12, max_col=6, max_row=tot_row-1)
    cats = Reference(ws_dash, min_col=2, min_row=13, max_row=tot_row-1)
    chart.add_data(data, titles_from_data=True)
    chart.set_categories(cats)
    chart.width = 16
    chart.height = 10
    ws_dash.add_chart(chart, "H11")

    # =========================================================================
    # 2. SHEET: STUDENT DATABASE
    # =========================================================================
    print("  -> Creating Sheet 2: Student Database...")
    ws_stud = wb.create_sheet(title="Student_Database")
    ws_stud.views.sheetView[0].showGridLines = True
    add_navigation_bar(ws_stud, "Student_Database")

    ws_stud["A4"] = "👨‍🎓 STUDENT ADMISSION & MASTER DATABASE"
    ws_stud["A4"].font = font_sheet_title

    stud_headers = [
        "Student ID", "Student Full Name", "Class", "Section", "Roll No",
        "Father's Name", "Mother's Name", "Contact Number", "Emergency Contact",
        "Residential Address", "Admission Date", "Blood Group", "Status"
    ]
    for col_idx, h in enumerate(stud_headers, start=1):
        c = ws_stud.cell(row=5, column=col_idx, value=h)
        c.font = font_table_header
        c.fill = fill_navy_dark
        c.alignment = align_center
        c.border = border_header
    ws_stud.row_dimensions[5].height = 24

    sample_students = [
        ("KS-101", "Aarav Ahmed", "Play", "Morning", 1, "Md. Rafiqul Islam", "Nasrin Sultana", "8801712345678", "8801812345678", "Block-A, Banasree, Dhaka", "2025-01-05", "B+", "Active"),
        ("KS-102", "Anika Tabassum", "Play", "Morning", 2, "Dr. Tariqul Hasan", "Rumana Parvin", "8801912345679", "8801719876543", "South Banasree, Dhaka", "2025-01-06", "O+", "Active"),
        ("KS-103", "Zayan Hossain", "Nursery", "A", 1, "Kamal Hossain", "Farzana Akter", "8801811223344", "8801911223344", "Road #7, Block-D, Banasree", "2024-01-10", "A+", "Active"),
        ("KS-104", "Marium Khan", "Nursery", "A", 2, "Mahmudur Rahman", "Sadia Jahan", "8801612349988", "8801712349988", "Rampura Main Road, Dhaka", "2024-01-12", "AB+", "Active"),
        ("KS-105", "Rayan Chowdhury", "KG", "A", 1, "Asaduzzaman Chowdhury", "Nusrat Jahan", "8801552345670", "8801752345670", "Aftabnagar, Sector-1, Dhaka", "2023-01-15", "O+", "Active"),
        ("KS-106", "Samia Noor", "KG", "B", 2, "Nurul Islam", "Salma Begum", "8801733445566", "8801833445566", "Khilgaon Chowdhury Para, Dhaka", "2023-01-18", "A-", "Active"),
        ("KS-107", "Tahmid Rahman", "Class 1", "A", 1, "Motiur Rahman", "Shamsun Nahar", "8801977665544", "8801777665544", "Goran, Khilgaon, Dhaka", "2022-01-10", "B+", "Active"),
        ("KS-108", "Nuha Fatima", "Class 1", "A", 2, "Shahadat Hossain", "Tanjina Sharmin", "8801822334455", "8801722334455", "Block-E, Banasree, Dhaka", "2022-01-15", "O+", "Active"),
        ("KS-109", "Wasif Karim", "Class 2", "A", 1, "Rezaul Karim", "Laila Arjumand", "8801766554433", "8801866554433", "Malibagh Chowdhury Para, Dhaka", "2021-01-12", "A+", "Active"),
        ("KS-110", "Afnan Sifat", "Class 3", "A", 1, "Sohrab Hossain", "Sharmin Sultana", "8801955443322", "8801755443322", "Banasree Central Road, Dhaka", "2020-01-10", "B+", "Active"),
        ("KS-111", "Faiza Tasnim", "Class 4", "A", 1, "Anwarul Haque", "Rehana Akhter", "8801844332211", "8801644332211", "Aftabnagar Main Road, Dhaka", "2019-01-08", "O-", "Active"),
        ("KS-112", "Mashrur Bin Mahbub", "Class 5", "A", 1, "Mahbub Alam", "Nargis Akter", "8801711998877", "8801911998877", "East Rampura, Dhaka", "2018-01-05", "AB-", "Active"),
    ]

    for row_idx, s in enumerate(sample_students, start=6):
        for col_idx, val in enumerate(s, start=1):
            c = ws_stud.cell(row=row_idx, column=col_idx, value=val)
            c.font = font_regular
            c.border = border_cell
            if col_idx in [1, 3, 4, 5, 11, 12, 13]:
                c.alignment = align_center
            else:
                c.alignment = align_left
            if row_idx % 2 == 0:
                c.fill = fill_zebra_alt

    # Data Validation for Class and Status
    dv_class = DataValidation(type="list", formula1='"Play,Nursery,KG,Class 1,Class 2,Class 3,Class 4,Class 5"', allow_blank=True)
    ws_stud.add_data_validation(dv_class)
    dv_class.add(f"C6:C100")

    dv_status = DataValidation(type="list", formula1='"Active,Inactive"', allow_blank=True)
    ws_stud.add_data_validation(dv_status)
    dv_status.add(f"M6:M100")

    # =========================================================================
    # 3. SHEET: DYNAMIC STUDENT SEARCH & PROFILE
    # =========================================================================
    print("  -> Creating Sheet 3: Dynamic Student Search & Profile...")
    ws_prof = wb.create_sheet(title="Student_Profile")
    ws_prof.views.sheetView[0].showGridLines = True
    add_navigation_bar(ws_prof, "Student_Profile")

    ws_prof["B4"] = "🔍 DYNAMIC STUDENT 360° PROFILE LOOKUP"
    ws_prof["B4"].font = font_sheet_title

    ws_prof["B6"] = "Select Student ID:"
    ws_prof["B6"].font = font_bold
    ws_prof["C6"] = "KS-101"
    ws_prof["C6"].font = Font(name="Segoe UI", size=12, bold=True, color=NAVY_DARK)
    ws_prof["C6"].fill = PatternFill(start_color="FFF3CD", end_color="FFF3CD", fill_type="solid")
    ws_prof["C6"].alignment = align_center
    ws_prof["C6"].border = Border(left=medium_navy, right=medium_navy, top=medium_navy, bottom=medium_navy)

    # Add Dropdown Validation for Selection
    dv_lookup = DataValidation(type="list", formula1="=Student_Database!$A$6:$A$50", allow_blank=False)
    ws_prof.add_data_validation(dv_lookup)
    dv_lookup.add("C6")

    # Profile Card Grid Layout
    profile_fields = [
        ("Student Full Name:", '=IFERROR(XLOOKUP(C6, Student_Database!A6:A50, Student_Database!B6:B50), "Select ID")'),
        ("Class & Section:", '=IFERROR(XLOOKUP(C6, Student_Database!A6:A50, Student_Database!C6:C50) & " - " & XLOOKUP(C6, Student_Database!A6:A50, Student_Database!D6:D50), "-")'),
        ("Roll Number:", '=IFERROR(XLOOKUP(C6, Student_Database!A6:A50, Student_Database!E6:E50), "-")'),
        ("Father\'s Name:", '=IFERROR(XLOOKUP(C6, Student_Database!A6:A50, Student_Database!F6:F50), "-")'),
        ("Mother\'s Name:", '=IFERROR(XLOOKUP(C6, Student_Database!A6:A50, Student_Database!G6:G50), "-")'),
        ("Contact Number:", '=IFERROR(XLOOKUP(C6, Student_Database!A6:A50, Student_Database!H6:H50), "-")'),
        ("Emergency Contact:", '=IFERROR(XLOOKUP(C6, Student_Database!A6:A50, Student_Database!I6:I50), "-")'),
        ("Residential Address:", '=IFERROR(XLOOKUP(C6, Student_Database!A6:A50, Student_Database!J6:J50), "-")'),
        ("Admission Date:", '=IFERROR(XLOOKUP(C6, Student_Database!A6:A50, Student_Database!K6:K50), "-")'),
        ("Blood Group:", '=IFERROR(XLOOKUP(C6, Student_Database!A6:A50, Student_Database!L6:L50), "-")'),
        ("Student Status:", '=IFERROR(XLOOKUP(C6, Student_Database!A6:A50, Student_Database!M6:M50), "-")'),
    ]

    for idx, (lbl, formula_val) in enumerate(profile_fields, start=9):
        ws_prof.cell(row=idx, column=2, value=lbl).font = font_bold
        ws_prof.cell(row=idx, column=2).fill = fill_kpi_card
        ws_prof.cell(row=idx, column=2).border = border_cell
        ws_prof.cell(row=idx, column=3, value=formula_val).font = font_regular
        ws_prof.cell(row=idx, column=3).border = border_cell
        ws_prof.row_dimensions[idx].height = 22

    # Financial & Academic Snapshot Cards on the right
    ws_prof.merge_cells("E9:G9")
    ws_prof["E9"] = "💳 Financial Status Summary"
    ws_prof["E9"].font = font_section_header
    ws_prof["E9"].fill = fill_navy_mid
    ws_prof["E9"].alignment = align_center

    ws_prof["E10"] = "Total Billed:"
    ws_prof["F10"] = '=IFERROR(SUMIF(Fee_Management!A6:A50, C6, Fee_Management!J6:J50), 0)'
    ws_prof["F10"].number_format = '"৳"#,##0.00'

    ws_prof["E11"] = "Total Paid:"
    ws_prof["F11"] = '=IFERROR(SUMIF(Fee_Management!A6:A50, C6, Fee_Management!K6:K50), 0)'
    ws_prof["F11"].number_format = '"৳"#,##0.00'

    ws_prof["E12"] = "Current Due Balance:"
    ws_prof["F12"] = '=IFERROR(SUMIF(Fee_Management!A6:A50, C6, Fee_Management!L6:L50), 0)'
    ws_prof["F12"].number_format = '"৳"#,##0.00'
    ws_prof["F12"].font = Font(name="Segoe UI", size=11, bold=True, color=RED_ALERT)

    for r in range(10, 13):
        ws_prof.cell(row=r, column=5).font = font_bold
        ws_prof.cell(row=r, column=5).border = border_cell
        ws_prof.cell(row=r, column=6).border = border_cell

    ws_prof.merge_cells("E15:G15")
    ws_prof["E15"] = "🏆 Academic Performance Snapshot"
    ws_prof["E15"].font = font_section_header
    ws_prof["E15"].fill = fill_navy_mid
    ws_prof["E15"].alignment = align_center

    ws_prof["E16"] = "Total Exam Marks:"
    ws_prof["F16"] = '=IFERROR(XLOOKUP(C6, Academic_Result!A6:A50, Academic_Result!K6:K50), "-")'
    ws_prof["E17"] = "Grade & GPA:"
    ws_prof["F17"] = '=IFERROR(XLOOKUP(C6, Academic_Result!A6:A50, Academic_Result!N6:N50) & " (GPA " & TEXT(XLOOKUP(C6, Academic_Result!A6:A50, Academic_Result!M6:M50),"0.00") & ")", "-")'
    ws_prof["E18"] = "Result Status:"
    ws_prof["F18"] = '=IFERROR(XLOOKUP(C6, Academic_Result!A6:A50, Academic_Result!O6:O50), "-")'

    for r in range(16, 19):
        ws_prof.cell(row=r, column=5).font = font_bold
        ws_prof.cell(row=r, column=5).border = border_cell
        ws_prof.cell(row=r, column=6).border = border_cell

    # =========================================================================
    # 4. SHEET: ATTENDANCE TRACKER
    # =========================================================================
    print("  -> Creating Sheet 4: Attendance Tracker...")
    ws_att = wb.create_sheet(title="Attendance_Tracker")
    ws_att.views.sheetView[0].showGridLines = True
    add_navigation_bar(ws_att, "Attendance_Tracker")

    ws_att["A4"] = "📅 DAILY STUDENT ATTENDANCE REGISTER"
    ws_att["A4"].font = font_sheet_title

    # Table Headers: Student details + 10 sample school days + Totals
    att_headers = ["Student ID", "Student Name", "Class", "Roll", "Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9", "Day 10", "Total Present", "Total Absent", "Attendance %"]
    for col_idx, h in enumerate(att_headers, start=1):
        c = ws_att.cell(row=5, column=col_idx, value=h)
        c.font = font_table_header
        c.fill = fill_navy_dark
        c.alignment = align_center
        c.border = border_header
    ws_att.row_dimensions[5].height = 24

    sample_att_patterns = [
        ["P", "P", "P", "P", "P", "P", "P", "P", "P", "P"],
        ["P", "P", "A", "P", "P", "P", "P", "P", "P", "P"],
        ["P", "P", "P", "P", "P", "P", "P", "P", "P", "P"],
        ["A", "P", "A", "P", "A", "P", "P", "P", "A", "P"],
        ["P", "P", "P", "P", "P", "P", "P", "P", "P", "P"],
        ["P", "P", "P", "P", "A", "P", "P", "P", "P", "P"],
        ["P", "P", "P", "P", "P", "P", "P", "P", "P", "P"],
        ["A", "A", "P", "A", "P", "A", "P", "A", "P", "A"],
        ["P", "P", "P", "P", "P", "P", "P", "P", "P", "P"],
        ["P", "P", "P", "P", "P", "P", "P", "P", "P", "P"],
        ["P", "P", "P", "P", "P", "P", "P", "P", "P", "P"],
        ["P", "P", "P", "P", "P", "P", "P", "P", "P", "P"],
    ]

    for idx, s in enumerate(sample_students, start=6):
        ws_att.cell(row=idx, column=1, value=s[0]).alignment = align_center
        ws_att.cell(row=idx, column=2, value=s[1]).alignment = align_left
        ws_att.cell(row=idx, column=3, value=s[2]).alignment = align_center
        ws_att.cell(row=idx, column=4, value=s[4]).alignment = align_center

        # Days
        pat = sample_att_patterns[idx - 6]
        for day_idx, st in enumerate(pat, start=5):
            c = ws_att.cell(row=idx, column=day_idx, value=st)
            c.alignment = align_center

        # Formulas
        ws_att.cell(row=idx, column=15, value=f'=COUNTIF(E{idx}:N{idx}, "P")').alignment = align_center
        ws_att.cell(row=idx, column=16, value=f'=COUNTIF(E{idx}:N{idx}, "A")').alignment = align_center
        pct_cell = ws_att.cell(row=idx, column=17, value=f'=O{idx}/(O{idx}+P{idx})')
        pct_cell.alignment = align_center
        pct_cell.number_format = '0.0%'

        for c_idx in range(1, 18):
            c = ws_att.cell(row=idx, column=c_idx)
            c.font = font_regular
            c.border = border_cell
            if idx % 2 == 0 and c_idx not in range(5, 15):
                c.fill = fill_zebra_alt

    # Conditional Formatting for Attendance: P (Green), A (Red), Attendance < 75% (Alert)
    green_fill = PatternFill(start_color="D4EDDA", end_color="D4EDDA", fill_type="solid")
    red_fill = PatternFill(start_color="F8D7DA", end_color="F8D7DA", fill_type="solid")
    ws_att.conditional_formatting.add("E6:N20", CellIsRule(operator="equal", formula=['"P"'], fill=green_fill))
    ws_att.conditional_formatting.add("E6:N20", CellIsRule(operator="equal", formula=['"A"'], fill=red_fill))
    ws_att.conditional_formatting.add("Q6:Q20", CellIsRule(operator="lessThan", formula=['0.75'], fill=red_fill, font=Font(color="721C24", bold=True)))

    # =========================================================================
    # 5. SHEET: FEE MANAGEMENT & COLLECTION
    # =========================================================================
    print("  -> Creating Sheet 5: Fee Management & Collection...")
    ws_fee = wb.create_sheet(title="Fee_Management")
    ws_fee.views.sheetView[0].showGridLines = True
    add_navigation_bar(ws_fee, "Fee_Management")

    ws_fee["A4"] = "💳 TUITION & COMPREHENSIVE FEE LEDGER"
    ws_fee["A4"].font = font_sheet_title

    fee_headers = [
        "Student ID", "Student Name", "Class", "Month", "Admission Fee",
        "Tuition Fee", "Exam Fee", "Transport Fee", "Fine/Late Fee",
        "Total Payable", "Amount Paid", "Due Amount", "Payment Date", "Payment Status"
    ]
    for col_idx, h in enumerate(fee_headers, start=1):
        c = ws_fee.cell(row=5, column=col_idx, value=h)
        c.font = font_table_header
        c.fill = fill_navy_dark
        c.alignment = align_center
        c.border = border_header
    ws_fee.row_dimensions[5].height = 24

    sample_fees = [
        ("KS-101", "Aarav Ahmed", "Play", "January 2025", 5000, 2500, 0, 1200, 0, 8700, "2025-01-10"),
        ("KS-102", "Anika Tabassum", "Play", "January 2025", 5000, 2500, 0, 0, 0, 5000, "2025-01-12"),
        ("KS-103", "Zayan Hossain", "Nursery", "January 2025", 0, 2800, 800, 1500, 0, 5100, "2025-01-08"),
        ("KS-104", "Marium Khan", "Nursery", "January 2025", 0, 2800, 800, 0, 200, 0, ""),
        ("KS-105", "Rayan Chowdhury", "KG", "January 2025", 0, 3000, 1000, 1500, 0, 5500, "2025-01-09"),
        ("KS-106", "Samia Noor", "KG", "January 2025", 0, 3000, 1000, 1200, 0, 3000, "2025-01-14"),
        ("KS-107", "Tahmid Rahman", "Class 1", "January 2025", 0, 3200, 1200, 1500, 0, 5900, "2025-01-07"),
        ("KS-108", "Nuha Fatima", "Class 1", "January 2025", 0, 3200, 1200, 0, 300, 0, ""),
        ("KS-109", "Wasif Karim", "Class 2", "January 2025", 0, 3500, 1200, 1500, 0, 6200, "2025-01-06"),
        ("KS-110", "Afnan Sifat", "Class 3", "January 2025", 0, 3800, 1500, 0, 0, 3500, "2025-01-11"),
        ("KS-111", "Faiza Tasnim", "Class 4", "January 2025", 0, 4000, 1500, 1800, 0, 7300, "2025-01-05"),
        ("KS-112", "Mashrur Bin Mahbub", "Class 5", "January 2025", 0, 4500, 2000, 1800, 0, 8300, "2025-01-07"),
    ]

    for idx, f in enumerate(sample_fees, start=6):
        ws_fee.cell(row=idx, column=1, value=f[0]).alignment = align_center
        ws_fee.cell(row=idx, column=2, value=f[1]).alignment = align_left
        ws_fee.cell(row=idx, column=3, value=f[2]).alignment = align_center
        ws_fee.cell(row=idx, column=4, value=f[3]).alignment = align_center

        # Breakdown amounts
        for c_offset, val in enumerate(f[4:9], start=5):
            c = ws_fee.cell(row=idx, column=c_offset, value=val)
            c.number_format = '"৳"#,##0.00'
            c.alignment = align_right

        # Dynamic Formula: Total Payable = SUM(E:I)
        payable_cell = ws_fee.cell(row=idx, column=10, value=f"=SUM(E{idx}:I{idx})")
        payable_cell.number_format = '"৳"#,##0.00'
        payable_cell.alignment = align_right
        payable_cell.font = font_bold

        # Amount Paid
        paid_cell = ws_fee.cell(row=idx, column=11, value=f[9])
        paid_cell.number_format = '"৳"#,##0.00'
        paid_cell.alignment = align_right

        # Dynamic Formula: Due Amount = Total Payable - Amount Paid
        due_cell = ws_fee.cell(row=idx, column=12, value=f"=J{idx}-K{idx}")
        due_cell.number_format = '"৳"#,##0.00'
        due_cell.alignment = align_right
        due_cell.font = font_bold

        # Payment Date
        ws_fee.cell(row=idx, column=13, value=f[10]).alignment = align_center

        # Dynamic Status Formula: IF(Due=0,"Paid", IF(Paid>0,"Partial","Unpaid"))
        status_cell = ws_fee.cell(row=idx, column=14, value=f'=IF(L{idx}<=0, "Paid", IF(K{idx}>0, "Partial", "Unpaid"))')
        status_cell.alignment = align_center
        status_cell.font = font_bold

        for c_idx in range(1, 15):
            c = ws_fee.cell(row=idx, column=c_idx)
            c.border = border_cell
            if idx % 2 == 0:
                c.fill = fill_zebra_alt

    # Add Summary Row
    tot_fee_row = 6 + len(sample_fees)
    ws_fee.cell(row=tot_fee_row, column=2, value="Grand Total:").font = font_bold
    for col_idx in range(5, 13):
        col_letter = get_column_letter(col_idx)
        c = ws_fee.cell(row=tot_fee_row, column=col_idx, value=f"=SUM({col_letter}6:{col_letter}{tot_fee_row-1})")
        c.font = font_bold
        c.number_format = '"৳"#,##0.00'
        c.fill = fill_navy_light
        c.border = border_header

    # Conditional Formatting for Due > 0
    ws_fee.conditional_formatting.add(f"L6:L{tot_fee_row-1}", CellIsRule(operator="greaterThan", formula=['0'], fill=fill_kpi_red, font=Font(color="900C3F", bold=True)))

    # =========================================================================
    # 6. SHEET: AUTOMATED FEE RECEIPT / INVOICE GENERATOR
    # =========================================================================
    print("  -> Creating Sheet 6: Automated Fee Receipt / Invoice Generator...")
    ws_rec = wb.create_sheet(title="Fee_Receipt")
    ws_rec.views.sheetView[0].showGridLines = True
    add_navigation_bar(ws_rec, "Fee_Receipt")

    ws_rec["B4"] = "🧾 PRINT-READY STUDENT MONEY RECEIPT / INVOICE (A4/A5)"
    ws_rec["B4"].font = font_sheet_title

    # Invoice Selector Controls
    ws_rec["B6"] = "Select Student ID:"
    ws_rec["B6"].font = font_bold
    ws_rec["C6"] = "KS-101"
    ws_rec["C6"].font = Font(name="Segoe UI", size=12, bold=True, color=NAVY_DARK)
    ws_rec["C6"].fill = PatternFill(start_color="FFF3CD", end_color="FFF3CD", fill_type="solid")
    ws_rec["C6"].alignment = align_center
    ws_rec["C6"].border = border_card

    dv_rec_student = DataValidation(type="list", formula1="=Fee_Management!$A$6:$A$50", allow_blank=False)
    ws_rec.add_data_validation(dv_rec_student)
    dv_rec_student.add("C6")

    # Formatted Voucher Box (Columns B to G, Rows 8 to 28)
    ws_rec.merge_cells("B8:G8")
    ws_rec["B8"] = "🏫 SUNSHINE KINDERGARTEN & JUNIOR ACADEMY"
    ws_rec["B8"].font = Font(name="Segoe UI", size=14, bold=True, color=WHITE)
    ws_rec["B8"].fill = fill_receipt_hdr
    ws_rec["B8"].alignment = align_center
    ws_rec.row_dimensions[8].height = 28

    ws_rec.merge_cells("B9:G9")
    ws_rec["B9"] = "House #12, Road #4, Block-C, Banasree, Dhaka-1219 | Phone: +8801711223344"
    ws_rec["B9"].font = Font(name="Segoe UI", size=9, color=WHITE)
    ws_rec["B9"].fill = fill_receipt_hdr
    ws_rec["B9"].alignment = align_center

    ws_rec.merge_cells("B10:G10")
    ws_rec["B10"] = "OFFICIAL STUDENT FEE MONEY RECEIPT"
    ws_rec["B10"].font = Font(name="Segoe UI", size=11, bold=True, color=NAVY_DARK)
    ws_rec["B10"].fill = fill_navy_light
    ws_rec["B10"].alignment = align_center

    # Student Info Grid
    ws_rec["B12"] = "Receipt No:"
    ws_rec["C12"] = '="REC-2025-" & C6'
    ws_rec["E12"] = "Date Issued:"
    ws_rec["F12"] = '=IFERROR(XLOOKUP(C6, Fee_Management!A6:A50, Fee_Management!M6:M50), TODAY())'

    ws_rec["B13"] = "Student Name:"
    ws_rec["C13"] = '=IFERROR(XLOOKUP(C6, Fee_Management!A6:A50, Fee_Management!B6:B50), "-")'
    ws_rec["E13"] = "Class & Section:"
    ws_rec["F13"] = '=IFERROR(XLOOKUP(C6, Student_Database!A6:A50, Student_Database!C6:C50) & " (" & XLOOKUP(C6, Student_Database!A6:A50, Student_Database!D6:D50) & ")", "-")'

    ws_rec["B14"] = "Father's Name:"
    ws_rec["C14"] = '=IFERROR(XLOOKUP(C6, Student_Database!A6:A50, Student_Database!F6:F50), "-")'
    ws_rec["E14"] = "Billing Month:"
    ws_rec["F14"] = '=IFERROR(XLOOKUP(C6, Fee_Management!A6:A50, Fee_Management!D6:D50), "January 2025")'

    for r in range(12, 15):
        ws_rec.cell(row=r, column=2).font = font_bold
        ws_rec.cell(row=r, column=5).font = font_bold

    # Breakdown Table Headers
    ws_rec.merge_cells("B16:C16")
    ws_rec["B16"] = "Fee Item Description"
    ws_rec["B16"].font = font_table_header
    ws_rec["B16"].fill = fill_navy_mid
    ws_rec["B16"].alignment = align_center

    ws_rec.merge_cells("D16:G16")
    ws_rec["D16"] = "Amount (BDT ৳)"
    ws_rec["D16"].font = font_table_header
    ws_rec["D16"].fill = fill_navy_mid
    ws_rec["D16"].alignment = align_center

    fee_items = [
        ("Admission / Registration Fee", "=IFERROR(XLOOKUP(C6, Fee_Management!A6:A50, Fee_Management!E6:E50), 0)"),
        ("Monthly Tuition Fee", "=IFERROR(XLOOKUP(C6, Fee_Management!A6:A50, Fee_Management!F6:F50), 0)"),
        ("Examination & Assessment Fee", "=IFERROR(XLOOKUP(C6, Fee_Management!A6:A50, Fee_Management!G6:G50), 0)"),
        ("School Transport / Van Fee", "=IFERROR(XLOOKUP(C6, Fee_Management!A6:A50, Fee_Management!H6:H50), 0)"),
        ("Late Fine & Miscellaneous", "=IFERROR(XLOOKUP(C6, Fee_Management!A6:A50, Fee_Management!I6:I50), 0)"),
    ]

    for idx, (lbl, f_val) in enumerate(fee_items, start=17):
        ws_rec.merge_cells(f"B{idx}:C{idx}")
        ws_rec.cell(row=idx, column=2, value=lbl).font = font_regular
        ws_rec.cell(row=idx, column=2).border = border_cell
        ws_rec.merge_cells(f"D{idx}:G{idx}")
        amt_c = ws_rec.cell(row=idx, column=4, value=f_val)
        amt_c.font = font_regular
        amt_c.number_format = '"৳"#,##0.00'
        amt_c.alignment = align_right
        amt_c.border = border_cell

    # Receipt Totals
    ws_rec.merge_cells("B22:C22")
    ws_rec["B22"] = "TOTAL PAYABLE:"
    ws_rec["B22"].font = font_bold
    ws_rec.merge_cells("D22:G22")
    ws_rec["D22"] = "=SUM(D17:D21)"
    ws_rec["D22"].font = font_bold
    ws_rec["D22"].number_format = '"৳"#,##0.00'
    ws_rec["D22"].alignment = align_right

    ws_rec.merge_cells("B23:C23")
    ws_rec["B23"] = "AMOUNT RECEIVED (PAID):"
    ws_rec["B23"].font = font_bold
    ws_rec["B23"].fill = fill_kpi_green
    ws_rec.merge_cells("D23:G23")
    ws_rec["D23"] = '=IFERROR(XLOOKUP(C6, Fee_Management!A6:A50, Fee_Management!K6:K50), 0)'
    ws_rec["D23"].font = font_bold
    ws_rec["D23"].fill = fill_kpi_green
    ws_rec["D23"].number_format = '"৳"#,##0.00'
    ws_rec["D23"].alignment = align_right

    ws_rec.merge_cells("B24:C24")
    ws_rec["B24"] = "CURRENT DUE BALANCE:"
    ws_rec["B24"].font = font_bold
    ws_rec["B24"].fill = fill_kpi_red
    ws_rec.merge_cells("D24:G24")
    ws_rec["D24"] = "=D22-D23"
    ws_rec["D24"].font = font_bold
    ws_rec["D24"].fill = fill_kpi_red
    ws_rec["D24"].number_format = '"৳"#,##0.00'
    ws_rec["D24"].alignment = align_right

    # Signatures
    ws_rec.merge_cells("B28:C28")
    ws_rec["B28"] = "____________________\nParent / Guardian Signature"
    ws_rec["B28"].alignment = align_center

    ws_rec.merge_cells("F28:G28")
    ws_rec["F28"] = "____________________\nAuthorized Cashier / Principal"
    ws_rec["F28"].alignment = align_center

    # =========================================================================
    # 7. SHEET: AUTOMATED DUE ALERT & WHATSAPP LINK
    # =========================================================================
    print("  -> Creating Sheet 7: Automated Due Alert & WhatsApp Link...")
    ws_due = wb.create_sheet(title="Due_Alerts")
    ws_due.views.sheetView[0].showGridLines = True
    add_navigation_bar(ws_due, "Due_Alerts")

    ws_due["A4"] = "📲 AUTOMATED DUE BALANCE ALERTS & 1-CLICK WHATSAPP MESSAGING"
    ws_due["A4"].font = font_sheet_title

    due_headers = [
        "Student ID", "Student Name", "Class", "Parent Contact",
        "Billed Fee", "Paid Amount", "Due Balance (৳)", "Status", "1-Click WhatsApp Reminder Link"
    ]
    for col_idx, h in enumerate(due_headers, start=1):
        c = ws_due.cell(row=5, column=col_idx, value=h)
        c.font = font_table_header
        c.fill = fill_navy_dark
        c.alignment = align_center
        c.border = border_header
    ws_due.row_dimensions[5].height = 24

    for idx, s in enumerate(sample_students, start=6):
        ws_due.cell(row=idx, column=1, value=s[0]).alignment = align_center
        ws_due.cell(row=idx, column=2, value=s[1]).alignment = align_left
        ws_due.cell(row=idx, column=3, value=s[2]).alignment = align_center
        ws_due.cell(row=idx, column=4, value=s[7]).alignment = align_center

        # Lookup from Fee_Management
        ws_due.cell(row=idx, column=5, value=f'=IFERROR(XLOOKUP(A{idx}, Fee_Management!A$6:A$50, Fee_Management!J$6:J$50), 0)').number_format = '"৳"#,##0.00'
        ws_due.cell(row=idx, column=6, value=f'=IFERROR(XLOOKUP(A{idx}, Fee_Management!A$6:A$50, Fee_Management!K$6:K$50), 0)').number_format = '"৳"#,##0.00'
        due_cell = ws_due.cell(row=idx, column=7, value=f'=IFERROR(XLOOKUP(A{idx}, Fee_Management!A$6:A$50, Fee_Management!L$6:L$50), 0)')
        due_cell.number_format = '"৳"#,##0.00'
        due_cell.font = font_bold

        ws_due.cell(row=idx, column=8, value=f'=IF(G{idx}>0, "DUE PENDING", "CLEARED")').alignment = align_center

        # Live Excel HYPERLINK Formula for WhatsApp with URL encoded Bengali message
        wa_formula = (
            f'=IF(G{idx}>0, '
            f'HYPERLINK("https://wa.me/" & D{idx} & "?text=" & '
            f'ENCODEURL("প্রিয় অভিভাবক, সানশাইন কিন্ডারগার্টেন থেকে বিনীতভাবে জানানো যাচ্ছে যে আপনার সন্তান " & B{idx} & " (ID: " & A{idx} & ") এর জানুয়ারি ২০২৫ মাসের বকেয়া ফি ৳" & TEXT(G{idx},"#,##0") & " টাকা। অনুগ্রহ করে দ্রুত পরিশোধ করুন। ধন্যবাদ।"), '
            f'"📲 Send WhatsApp Notice"), "✅ Paid")'
        )
        link_cell = ws_due.cell(row=idx, column=9, value=wa_formula)
        link_cell.alignment = align_center
        link_cell.font = font_due_link

        for col_idx in range(1, 10):
            c = ws_due.cell(row=idx, column=col_idx)
            c.border = border_cell
            if idx % 2 == 0:
                c.fill = fill_zebra_alt

    # =========================================================================
    # 8. SHEET: STAFF & PAYROLL MANAGEMENT
    # =========================================================================
    print("  -> Creating Sheet 8: Staff & Payroll Management...")
    ws_staff = wb.create_sheet(title="Staff_Payroll")
    ws_staff.views.sheetView[0].showGridLines = True
    add_navigation_bar(ws_staff, "Staff_Payroll")

    ws_staff["A4"] = "💼 TEACHER & STAFF PAYROLL REGISTER"
    ws_staff["A4"].font = font_sheet_title

    staff_headers = [
        "Staff ID", "Full Name", "Designation", "Contact No",
        "Basic Salary", "Allowances", "Deductions", "Net Salary (৳)", "Payment Date", "Status"
    ]
    for col_idx, h in enumerate(staff_headers, start=1):
        c = ws_staff.cell(row=5, column=col_idx, value=h)
        c.font = font_table_header
        c.fill = fill_navy_dark
        c.alignment = align_center
        c.border = border_header
    ws_staff.row_dimensions[5].height = 24

    sample_staff = [
        ("ST-01", "Mrs. Farhana Yasmin", "Principal", "01711223344", 45000, 8000, 1500, "2025-01-01", "Paid"),
        ("ST-02", "Fatema Khatun", "Kindergarten Specialist", "01722334455", 25000, 3500, 500, "2025-01-01", "Paid"),
        ("ST-03", "Md. Mahmudul Hasan", "Senior Teacher", "01833445566", 28000, 4000, 600, "2025-01-01", "Paid"),
        ("ST-04", "Shabnam Mustari", "Assistant Teacher", "01944556677", 22000, 2500, 500, "2025-01-01", "Paid"),
        ("ST-05", "Tanvir Hossain", "Admin & Accounts", "01655667788", 24000, 3000, 500, "2025-01-01", "Paid"),
        ("ST-06", "Kulsum Begum", "Caretaker/Aya", "01566778899", 12000, 1500, 0, "2025-01-01", "Paid"),
    ]

    for idx, st in enumerate(sample_staff, start=6):
        ws_staff.cell(row=idx, column=1, value=st[0]).alignment = align_center
        ws_staff.cell(row=idx, column=2, value=st[1]).alignment = align_left
        ws_staff.cell(row=idx, column=3, value=st[2]).alignment = align_left
        ws_staff.cell(row=idx, column=4, value=st[3]).alignment = align_center

        ws_staff.cell(row=idx, column=5, value=st[4]).number_format = '"৳"#,##0.00'
        ws_staff.cell(row=idx, column=6, value=st[5]).number_format = '"৳"#,##0.00'
        ws_staff.cell(row=idx, column=7, value=st[6]).number_format = '"৳"#,##0.00'

        # Formula: Net Salary = Basic + Allowances - Deductions
        net_c = ws_staff.cell(row=idx, column=8, value=f"=E{idx}+F{idx}-G{idx}")
        net_c.number_format = '"৳"#,##0.00'
        net_c.font = font_bold

        ws_staff.cell(row=idx, column=9, value=st[7]).alignment = align_center
        ws_staff.cell(row=idx, column=10, value=st[8]).alignment = align_center

        for col_idx in range(1, 11):
            c = ws_staff.cell(row=idx, column=col_idx)
            c.border = border_cell
            if idx % 2 == 0:
                c.fill = fill_zebra_alt

    # Staff Total Row
    tot_st_row = 6 + len(sample_staff)
    ws_staff.cell(row=tot_st_row, column=2, value="Total Monthly Payroll:").font = font_bold
    for col_idx in range(5, 9):
        col_letter = get_column_letter(col_idx)
        c = ws_staff.cell(row=tot_st_row, column=col_idx, value=f"=SUM({col_letter}6:{col_letter}{tot_st_row-1})")
        c.font = font_bold
        c.number_format = '"৳"#,##0.00'
        c.fill = fill_navy_light
        c.border = border_header

    # =========================================================================
    # 9. SHEET: EXPENSE TRACKER
    # =========================================================================
    print("  -> Creating Sheet 9: Expense Tracker...")
    ws_exp = wb.create_sheet(title="Expense_Tracker")
    ws_exp.views.sheetView[0].showGridLines = True
    add_navigation_bar(ws_exp, "Expense_Tracker")

    ws_exp["A4"] = "📉 OPERATIONAL & ADMINISTRATIVE EXPENSE REGISTER"
    ws_exp["A4"].font = font_sheet_title

    exp_headers = ["Expense ID", "Date", "Category", "Expense Description", "Amount (৳)", "Approved By"]
    for col_idx, h in enumerate(exp_headers, start=1):
        c = ws_exp.cell(row=5, column=col_idx, value=h)
        c.font = font_table_header
        c.fill = fill_navy_dark
        c.alignment = align_center
        c.border = border_header
    ws_exp.row_dimensions[5].height = 24

    sample_expenses = [
        ("EXP-101", "2025-01-02", "Rent", "School Campus Monthly Building Rent", 55000, "Principal"),
        ("EXP-102", "2025-01-03", "Utility", "Electricity & Water Bill (DESCO & WASA)", 14500, "Admin & Accounts"),
        ("EXP-103", "2025-01-05", "Supplies", "Kindergarten Art, Craft Paper & Montessori Toys", 12000, "Principal"),
        ("EXP-104", "2025-01-08", "Snacks/Tiffin", "Kids Morning Healthy Biscuit & Milk Pack", 8500, "Admin & Accounts"),
        ("EXP-105", "2025-01-10", "Marketing", "Admission Banners, Leaflets & Facebook Promotion", 9500, "Principal"),
        ("EXP-106", "2025-01-15", "Maintenance", "Classroom AC Servicing & Playground Swing Repair", 6200, "Admin & Accounts"),
        ("EXP-107", "2025-01-20", "Misc", "First Aid Medical Kit and Disinfectant Supplies", 3500, "Principal"),
    ]

    for idx, e in enumerate(sample_expenses, start=6):
        ws_exp.cell(row=idx, column=1, value=e[0]).alignment = align_center
        ws_exp.cell(row=idx, column=2, value=e[1]).alignment = align_center
        ws_exp.cell(row=idx, column=3, value=e[2]).alignment = align_center
        ws_exp.cell(row=idx, column=4, value=e[3]).alignment = align_left

        amt_c = ws_exp.cell(row=idx, column=5, value=e[4])
        amt_c.number_format = '"৳"#,##0.00'
        amt_c.alignment = align_right

        ws_exp.cell(row=idx, column=6, value=e[5]).alignment = align_center

        for col_idx in range(1, 7):
            c = ws_exp.cell(row=idx, column=col_idx)
            c.border = border_cell
            if idx % 2 == 0:
                c.fill = fill_zebra_alt

    # Category Validation
    dv_exp_cat = DataValidation(type="list", formula1='"Rent,Utility,Supplies,Marketing,Maintenance,Salary,Snacks/Tiffin,Misc"', allow_blank=True)
    ws_exp.add_data_validation(dv_exp_cat)
    dv_exp_cat.add("C6:C50")

    # Total Expense Row
    tot_exp_row = 6 + len(sample_expenses)
    ws_exp.cell(row=tot_exp_row, column=4, value="Total Operational Expenses:").font = font_bold
    ws_exp.cell(row=tot_exp_row, column=4).alignment = align_right
    exp_sum = ws_exp.cell(row=tot_exp_row, column=5, value=f"=SUM(E6:E{tot_exp_row-1})")
    exp_sum.font = font_bold
    exp_sum.number_format = '"৳"#,##0.00'
    exp_sum.fill = fill_navy_light
    exp_sum.border = border_header

    # =========================================================================
    # 10. SHEET: ACADEMIC RESULT & REPORT CARD
    # =========================================================================
    print("  -> Creating Sheet 10: Academic Result & Report Card...")
    ws_res = wb.create_sheet(title="Academic_Result")
    ws_res.views.sheetView[0].showGridLines = True
    add_navigation_bar(ws_res, "Academic_Result")

    ws_res["A4"] = "🏆 ACADEMIC MARKSHEET, GPA & REPORT CARD REGISTER"
    ws_res["A4"].font = font_sheet_title

    res_headers = [
        "Student ID", "Student Name", "Class", "Roll", "Term",
        "Bangla (100)", "English (100)", "Math (100)", "GK (100)", "Science (100)", "Drawing (100)",
        "Total Marks (600)", "Average (%)", "GPA (5.00)", "Grade", "Status", "Teacher Remarks"
    ]
    for col_idx, h in enumerate(res_headers, start=1):
        c = ws_res.cell(row=5, column=col_idx, value=h)
        c.font = font_table_header
        c.fill = fill_navy_dark
        c.alignment = align_center
        c.border = border_header
    ws_res.row_dimensions[5].height = 24

    sample_results = [
        ("KS-101", "Aarav Ahmed", "Play", 1, "1st Term", 95, 92, 98, 90, 88, 96, "Outstanding performance! Very attentive in class."),
        ("KS-102", "Anika Tabassum", "Play", 2, "1st Term", 88, 90, 85, 87, 84, 92, "Very creative and punctual."),
        ("KS-103", "Zayan Hossain", "Nursery", 1, "1st Term", 92, 95, 96, 94, 91, 98, "Top in class. Excellent handwriting."),
        ("KS-104", "Marium Khan", "Nursery", 2, "1st Term", 78, 82, 75, 80, 76, 88, "Good effort, needs practice in Math."),
        ("KS-105", "Rayan Chowdhury", "KG", 1, "1st Term", 96, 94, 99, 92, 95, 97, "Exceptional mathematical and analytical skill."),
        ("KS-106", "Samia Noor", "KG", 2, "1st Term", 84, 86, 82, 85, 80, 90, "Very neat work and respectful."),
        ("KS-107", "Tahmid Rahman", "Class 1", 1, "1st Term", 94, 91, 97, 89, 93, 92, "Active participant and quick learner."),
        ("KS-108", "Nuha Fatima", "Class 1", 2, "1st Term", 72, 75, 68, 74, 70, 85, "Regular attendance will boost confidence."),
        ("KS-109", "Wasif Karim", "Class 2", 1, "1st Term", 90, 92, 95, 91, 94, 90, "Brilliant student and disciplined."),
        ("KS-110", "Afnan Sifat", "Class 3", 1, "1st Term", 86, 88, 89, 85, 87, 88, "Consistent in all examinations."),
        ("KS-111", "Faiza Tasnim", "Class 4", 1, "1st Term", 93, 95, 98, 96, 94, 95, "First position in class. Exceptional student."),
        ("KS-112", "Mashrur Bin Mahbub", "Class 5", 1, "1st Term", 95, 93, 99, 94, 97, 92, "Demonstrates stellar leadership."),
    ]

    for idx, r in enumerate(sample_results, start=6):
        ws_res.cell(row=idx, column=1, value=r[0]).alignment = align_center
        ws_res.cell(row=idx, column=2, value=r[1]).alignment = align_left
        ws_res.cell(row=idx, column=3, value=r[2]).alignment = align_center
        ws_res.cell(row=idx, column=4, value=r[3]).alignment = align_center
        ws_res.cell(row=idx, column=5, value=r[4]).alignment = align_center

        # Subject marks
        for c_offset, score in enumerate(r[5:11], start=6):
            ws_res.cell(row=idx, column=c_offset, value=score).alignment = align_center

        # Formula: Total Marks = SUM(F:K)
        tot_marks = ws_res.cell(row=idx, column=12, value=f"=SUM(F{idx}:K{idx})")
        tot_marks.alignment = align_center
        tot_marks.font = font_bold

        # Formula: Average = AVERAGE(F:K)
        avg_marks = ws_res.cell(row=idx, column=13, value=f"=AVERAGE(F{idx}:K{idx})")
        avg_marks.alignment = align_center
        avg_marks.number_format = '0.00'

        # Formula: GPA (Bangladeshi 5.00 Scale based on Average)
        gpa_c = ws_res.cell(row=idx, column=14, value=f'=IF(M{idx}>=80, 5.00, IF(M{idx}>=70, 4.00, IF(M{idx}>=60, 3.50, IF(M{idx}>=50, 3.00, IF(M{idx}>=40, 2.00, IF(M{idx}>=33, 1.00, 0.00))))))')
        gpa_c.alignment = align_center
        gpa_c.number_format = '0.00'
        gpa_c.font = font_bold

        # Formula: Grade Letter
        grd_c = ws_res.cell(row=idx, column=15, value=f'=IF(M{idx}>=80, "A+", IF(M{idx}>=70, "A", IF(M{idx}>=60, "A-", IF(M{idx}>=50, "B", IF(M{idx}>=40, "C", IF(M{idx}>=33, "D", "F"))))))')
        grd_c.alignment = align_center
        grd_c.font = font_bold

        # Formula: Pass / Fail
        stat_c = ws_res.cell(row=idx, column=16, value=f'=IF(M{idx}>=33, "Pass", "Fail")')
        stat_c.alignment = align_center
        stat_c.font = font_bold

        # Remarks
        ws_res.cell(row=idx, column=17, value=r[11]).alignment = align_left

        for col_idx in range(1, 18):
            c = ws_res.cell(row=idx, column=col_idx)
            c.border = border_cell
            if idx % 2 == 0:
                c.fill = fill_zebra_alt

    # =========================================================================
    # AUTO-FIT COLUMN WIDTHS ACROSS ALL SHEETS
    # =========================================================================
    print("  -> Auto-adjusting column widths and margins for professional layout...")
    for sheet in wb.worksheets:
        for col in sheet.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            # Skip merged banner row 1
            for cell in col[1:]:
                if cell.value:
                    val_str = str(cell.value)
                    if not val_str.startswith("="):
                        max_len = max(max_len, len(val_str))
            sheet.column_dimensions[col_letter].width = max(max_len + 4, 12)

    # Save Workbook
    wb.save(output_filename)
    print(f"✨ SUCCESS: Fully automated workbook '{output_filename}' generated successfully with 10 worksheets!")
    return output_filename


if __name__ == "__main__":
    output_file = sys.argv[1] if len(sys.argv) > 1 else "Kindergarten_School_System.xlsx"
    create_school_management_workbook(output_file)
`;
};
