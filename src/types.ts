export type StudentClass = 'Play' | 'Nursery' | 'KG' | 'Class 1' | 'Class 2' | 'Class 3' | 'Class 4' | 'Class 5';
export type Section = 'A' | 'B' | 'Morning' | 'Day';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
export type StudentStatus = 'Active' | 'Inactive';
export type PaymentStatus = 'Paid' | 'Partial' | 'Unpaid';
export type ExpenseCategory =
  | 'Rent'
  | 'Utility'
  | 'Electricity & Utility'
  | 'Supplies'
  | 'Stationeries'
  | 'Marketing'
  | 'Marketing & Promotion'
  | 'Maintenance'
  | 'Campus Maintenance'
  | 'Salary'
  | 'Snacks/Tiffin'
  | 'Refreshments'
  | 'Events & Sports'
  | 'Misc'
  | 'Others';
export type StaffDesignation = 'Principal' | 'Vice Principal' | 'Senior Teacher' | 'Assistant Teacher' | 'Kindergarten Specialist' | 'Admin & Accounts' | 'Caretaker/Aya' | 'Driver';
export type StaffStatus = 'Paid' | 'Pending';

export interface Student {
  id: string; // e.g. "KS-101"
  name: string;
  nameBn: string;
  studentClass: StudentClass;
  section: Section;
  rollNo: number;
  fatherName: string;
  motherName: string;
  contactNumber: string;
  emergencyContact: string;
  address: string;
  admissionDate: string;
  bloodGroup: BloodGroup;
  status: StudentStatus;
  avatarUrl?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: StudentClass;
  month: string; // e.g. "January 2025"
  admissionFee: number;
  monthlyTuitionFee: number;
  examFee: number;
  transportFee: number;
  fineFee: number;
  totalPayable: number;
  amountPaid: number;
  dueAmount: number;
  paymentDate: string;
  paymentStatus: PaymentStatus;
  receiptNo: string;
  paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Bank';
}

export interface Staff {
  id: string; // e.g. "ST-01"
  name: string;
  designation: StaffDesignation;
  contact: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentDate: string;
  status: StaffStatus;
}

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  approvedBy: string;
}

export type UserRole = 'admin' | 'principal' | 'teacher' | 'accountant' | 'parent';

export interface User {
  id: string;
  name: string;
  nameBn?: string;
  email: string;
  username: string;
  role: UserRole;
  roleTitle: string;
  avatarUrl?: string;
  phone?: string;
  designation?: string;
  linkedStudentId?: string; // If role is 'parent'
  permissions: string[];
}

export interface AcademicResult {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: StudentClass;
  rollNo: number;
  term: '1st Term' | '2nd Term' | 'Annual Exam' | '1st Term Evaluation' | 'Final Evaluation' | string;
  bangla: number;
  english: number;
  math: number;
  gk: number;
  science: number;
  drawing: number;
  totalMarks: number;
  averageMarks: number;
  gpa: number;
  grade: string;
  status: 'Pass' | 'Fail';
  remarks: string;
}

export interface SchoolInfo {
  name: string;
  nameBn: string;
  established: string;
  address: string;
  phone: string;
  email: string;
  curriculum: string;
  principalName: string;
}
