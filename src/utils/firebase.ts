import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Student,
  FeeRecord,
  Staff,
  Expense,
  AttendanceRecord,
  AcademicResult,
  SchoolInfo,
} from '../types';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore with custom database ID from config if present
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Test server connectivity
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'system', 'connection_test'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is currently offline or unreachable.');
      return false;
    }
    // Any other response means we connected to Firestore server
    return true;
  }
}

// Firestore Collection Names
export const COLLECTIONS = {
  STUDENTS: 'students',
  FEES: 'fees',
  STAFF: 'staff',
  EXPENSES: 'expenses',
  ATTENDANCE: 'attendance',
  RESULTS: 'results',
  SETTINGS: 'settings',
};

// ----------------------------------------------------------------------
// 1. REAL-TIME SUBSCRIPTIONS (Cross-Device Real-Time Synchronization)
// ----------------------------------------------------------------------

export function subscribeToStudents(
  onUpdate: (students: Student[]) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    collection(db, COLLECTIONS.STUDENTS),
    (snapshot) => {
      const list: Student[] = [];
      snapshot.forEach((d) => {
        list.push({ ...(d.data() as Student), id: d.id });
      });
      // Sort by roll number or ID
      list.sort((a, b) => (a.rollNo || 0) - (b.rollNo || 0));
      onUpdate(list);
    },
    (err) => {
      console.error('Students sync error:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToFees(
  onUpdate: (fees: FeeRecord[]) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    collection(db, COLLECTIONS.FEES),
    (snapshot) => {
      const list: FeeRecord[] = [];
      snapshot.forEach((d) => {
        list.push({ ...(d.data() as FeeRecord), id: d.id });
      });
      onUpdate(list);
    },
    (err) => {
      console.error('Fees sync error:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToStaff(
  onUpdate: (staff: Staff[]) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    collection(db, COLLECTIONS.STAFF),
    (snapshot) => {
      const list: Staff[] = [];
      snapshot.forEach((d) => {
        list.push({ ...(d.data() as Staff), id: d.id });
      });
      onUpdate(list);
    },
    (err) => {
      console.error('Staff sync error:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToExpenses(
  onUpdate: (expenses: Expense[]) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    collection(db, COLLECTIONS.EXPENSES),
    (snapshot) => {
      const list: Expense[] = [];
      snapshot.forEach((d) => {
        list.push({ ...(d.data() as Expense), id: d.id });
      });
      onUpdate(list);
    },
    (err) => {
      console.error('Expenses sync error:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToAttendance(
  onUpdate: (attendance: AttendanceRecord[]) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    collection(db, COLLECTIONS.ATTENDANCE),
    (snapshot) => {
      const list: AttendanceRecord[] = [];
      snapshot.forEach((d) => {
        list.push({ ...(d.data() as AttendanceRecord), id: d.id });
      });
      onUpdate(list);
    },
    (err) => {
      console.error('Attendance sync error:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToResults(
  onUpdate: (results: AcademicResult[]) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    collection(db, COLLECTIONS.RESULTS),
    (snapshot) => {
      const list: AcademicResult[] = [];
      snapshot.forEach((d) => {
        list.push({ ...(d.data() as AcademicResult), id: d.id });
      });
      onUpdate(list);
    },
    (err) => {
      console.error('Results sync error:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToSchoolInfo(
  onUpdate: (info: SchoolInfo) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    doc(db, COLLECTIONS.SETTINGS, 'school_info'),
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as SchoolInfo);
      }
    },
    (err) => {
      console.error('School info sync error:', err);
      if (onError) onError(err);
    }
  );
}

// ----------------------------------------------------------------------
// 2. CLOUD MUTATION ACTIONS (Direct write to Firestore)
// ----------------------------------------------------------------------

export async function saveStudentToCloud(student: Student): Promise<void> {
  const docRef = doc(db, COLLECTIONS.STUDENTS, student.id);
  await setDoc(docRef, student, { merge: true });
}

export async function deleteStudentFromCloud(studentId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.STUDENTS, studentId));
}

export async function saveFeeRecordToCloud(fee: FeeRecord): Promise<void> {
  const docRef = doc(db, COLLECTIONS.FEES, fee.id);
  await setDoc(docRef, fee, { merge: true });
}

export async function deleteFeeRecordFromCloud(feeId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.FEES, feeId));
}

export async function saveStaffToCloud(staff: Staff): Promise<void> {
  const docRef = doc(db, COLLECTIONS.STAFF, staff.id);
  await setDoc(docRef, staff, { merge: true });
}

export async function deleteStaffFromCloud(staffId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.STAFF, staffId));
}

export async function saveExpenseToCloud(expense: Expense): Promise<void> {
  const docRef = doc(db, COLLECTIONS.EXPENSES, expense.id);
  await setDoc(docRef, expense, { merge: true });
}

export async function deleteExpenseFromCloud(expenseId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.EXPENSES, expenseId));
}

export async function saveAttendanceRecordsToCloud(records: AttendanceRecord[]): Promise<void> {
  if (!records || records.length === 0) return;
  const batch = writeBatch(db);
  records.forEach((record) => {
    const docRef = doc(db, COLLECTIONS.ATTENDANCE, record.id);
    batch.set(docRef, record, { merge: true });
  });
  await batch.commit();
}

export async function saveAcademicResultToCloud(result: AcademicResult): Promise<void> {
  const docRef = doc(db, COLLECTIONS.RESULTS, result.id);
  await setDoc(docRef, result, { merge: true });
}

export async function deleteAcademicResultFromCloud(resultId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.RESULTS, resultId));
}

export async function saveSchoolInfoToCloud(info: SchoolInfo): Promise<void> {
  const docRef = doc(db, COLLECTIONS.SETTINGS, 'school_info');
  await setDoc(docRef, info, { merge: true });
}

// ----------------------------------------------------------------------
// 3. INITIAL SEEDING FOR EMPTY CLOUD DATABASE
// ----------------------------------------------------------------------

export async function seedInitialDataIfEmpty(initialData: {
  students: Student[];
  fees: FeeRecord[];
  staff: Staff[];
  expenses: Expense[];
  attendance: AttendanceRecord[];
  results: AcademicResult[];
  schoolInfo: SchoolInfo;
}) {
  try {
    const studentsSnap = await getDocs(collection(db, COLLECTIONS.STUDENTS));
    if (studentsSnap.empty) {
      console.log('Seeding initial data to Firebase Cloud Firestore...');
      const batch = writeBatch(db);

      // Seed Students
      initialData.students.forEach((s) => {
        batch.set(doc(db, COLLECTIONS.STUDENTS, s.id), s);
      });

      // Seed Fees
      initialData.fees.forEach((f) => {
        batch.set(doc(db, COLLECTIONS.FEES, f.id), f);
      });

      // Seed Staff
      initialData.staff.forEach((st) => {
        batch.set(doc(db, COLLECTIONS.STAFF, st.id), st);
      });

      // Seed Expenses
      initialData.expenses.forEach((e) => {
        batch.set(doc(db, COLLECTIONS.EXPENSES, e.id), e);
      });

      // Seed Attendance
      initialData.attendance.forEach((a) => {
        batch.set(doc(db, COLLECTIONS.ATTENDANCE, a.id), a);
      });

      // Seed Results
      initialData.results.forEach((r) => {
        batch.set(doc(db, COLLECTIONS.RESULTS, r.id), r);
      });

      // Seed School Info
      batch.set(doc(db, COLLECTIONS.SETTINGS, 'school_info'), initialData.schoolInfo);

      await batch.commit();
      console.log('Firebase Cloud database initial seed complete!');
    }
  } catch (err) {
    console.warn('Error during initial cloud seed:', err);
  }
}
