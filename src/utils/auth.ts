import { User } from '../types';

export interface StoredAuthAccount extends User {
  passwordHash: string; // Stored plain/base64 for client mock or custom
}

export const INITIAL_USERS: StoredAuthAccount[] = [
  {
    id: 'USR-ADMIN-01',
    name: 'Mrs. Farhana Yasmin, M.Ed',
    nameBn: 'মিসেস ফারহানা ইয়াসমিন',
    email: 'admin@sunshine.edu.bd',
    username: 'admin',
    passwordHash: 'admin123',
    role: 'admin',
    roleTitle: 'অধ্যক্ষ ও প্রধান প্রশাসক (Principal & Admin)',
    designation: 'Principal & Founder',
    phone: '+8801711223344',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    permissions: ['all', 'students:all', 'fees:all', 'payroll:all', 'expenses:all', 'results:all', 'sync:all', 'settings:all'],
  },
  {
    id: 'USR-TEACHER-01',
    name: 'Sadia Afrin',
    nameBn: 'সাদিয়া আফরিন',
    email: 'teacher@sunshine.edu.bd',
    username: 'teacher',
    passwordHash: 'teacher123',
    role: 'teacher',
    roleTitle: 'সিনিয়র শিক্ষক (Senior Teacher & Academic Head)',
    designation: 'Kindergarten & Academic Coordinator',
    phone: '+8801719876543',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    permissions: ['dashboard:view', 'students:view', 'students:edit', 'attendance:all', 'results:all', 'profile:view'],
  },
  {
    id: 'USR-ACCOUNTS-01',
    name: 'Kamrul Hasan',
    nameBn: 'কামরুল হাসান',
    email: 'accounts@sunshine.edu.bd',
    username: 'accountant',
    passwordHash: 'account123',
    role: 'accountant',
    roleTitle: 'হিসাবরক্ষণ কর্মকর্তা (Accounts & Billing Officer)',
    designation: 'Senior Accountant',
    phone: '+8801811223344',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    permissions: ['dashboard:view', 'fees:all', 'receipts:all', 'expenses:all', 'due_alerts:all', 'students:view'],
  },
  {
    id: 'USR-PARENT-01',
    name: 'Md. Rafiqul Islam (Father)',
    nameBn: 'মোঃ রফিকুল ইসলাম (অভিভাবক)',
    email: 'parent@sunshine.edu.bd',
    username: 'parent',
    passwordHash: 'parent123',
    role: 'parent',
    roleTitle: 'অভিভাবক পোর্টাল (Guardian / Parent)',
    designation: 'Guardian of Aarav Ahmed (Play)',
    linkedStudentId: 'KS-101',
    phone: '8801712345678',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    permissions: ['profile:view', 'fees:view', 'results:view', 'attendance:view'],
  },
];

const AUTH_STORAGE_KEY = 'sunshine_auth_current_user_v2';
const USERS_STORAGE_KEY = 'sunshine_auth_all_users_v2';

export function getStoredUsers(): StoredAuthAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USERS;
  }
}

export function saveStoredUsers(users: StoredAuthAccount[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users', e);
  }
}

export function getStoredCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredCurrentUser(user: User | null): void {
  try {
    if (!user) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    }
  } catch (e) {
    console.error('Failed to update auth session', e);
  }
}

export function loginUser(
  usernameOrEmail: string,
  passwordInput: string
): { success: boolean; user?: User; error?: string } {
  const users = getStoredUsers();
  const trimmed = usernameOrEmail.trim().toLowerCase();

  const matched = users.find(
    (u) =>
      u.username.toLowerCase() === trimmed ||
      u.email.toLowerCase() === trimmed
  );

  if (!matched) {
    return {
      success: false,
      error: 'ব্যবহারকারী (Username বা Email) পাওয়া যায়নি। দয়া করে সঠিক তথ্য দিন।',
    };
  }

  if (matched.passwordHash !== passwordInput) {
    return {
      success: false,
      error: 'পাসওয়ার্ড সঠিক নয়। দয়া করে পুনরায় চেষ্টা করুন।',
    };
  }

  const { passwordHash: _, ...safeUser } = matched;
  setStoredCurrentUser(safeUser);
  return { success: true, user: safeUser };
}

export function logoutUser(): void {
  setStoredCurrentUser(null);
}

export function updateUserPassword(
  userId: string,
  oldPass: string,
  newPass: string
): { success: boolean; error?: string } {
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === userId);

  if (index === -1) {
    return { success: false, error: 'ইউজার পাওয়া যায়নি।' };
  }

  if (users[index].passwordHash !== oldPass) {
    return { success: false, error: 'বর্তমান পাসওয়ার্ড সঠিক নয়।' };
  }

  if (newPass.length < 4) {
    return { success: false, error: 'নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' };
  }

  users[index].passwordHash = newPass;
  saveStoredUsers(users);
  return { success: true };
}
