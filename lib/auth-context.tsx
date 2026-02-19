'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface User {
  email: string;
  name: string;
  createdAt: string;
}

interface HistoryEntry {
  id: string;
  fileName: string;
  uploadedAt: string;
  expiresAt: string;
  totalVariants: number;
  pharmacogeneCount: number;
  grade: string;
  overallRisk: string;
  reliability: number;
  summary: string;
  result: any;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (email: string, password: string, name: string) => { success: boolean; error?: string };
  logout: () => void;
  history: HistoryEntry[];
  addToHistory: (result: any) => void;
  deleteFromHistory: (id: string) => void;
  clearExpired: () => number;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = 'biosentinel_users';
const SESSION_KEY = 'biosentinel_session';
const HISTORY_KEY = 'biosentinel_history';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `bs_${Math.abs(hash).toString(36)}_${password.length}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load session on mount
  useEffect(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        const parsed = JSON.parse(session);
        setUser(parsed);
        loadHistory(parsed.email);
      }
    } catch {
      // ignore
    }
    setIsLoading(false);
  }, []);

  const loadHistory = (email: string) => {
    try {
      const raw = localStorage.getItem(`${HISTORY_KEY}_${email}`);
      if (raw) {
        const entries: HistoryEntry[] = JSON.parse(raw);
        // Filter out expired
        const now = Date.now();
        const valid = entries.filter(e => new Date(e.expiresAt).getTime() > now);
        if (valid.length !== entries.length) {
          localStorage.setItem(`${HISTORY_KEY}_${email}`, JSON.stringify(valid));
        }
        setHistory(valid);
      } else {
        setHistory([]);
      }
    } catch {
      setHistory([]);
    }
  };

  const saveHistory = useCallback((email: string, entries: HistoryEntry[]) => {
    localStorage.setItem(`${HISTORY_KEY}_${email}`, JSON.stringify(entries));
    setHistory(entries);
  }, []);

  const login = (email: string, password: string) => {
    try {
      const usersRaw = localStorage.getItem(USERS_KEY);
      const users: Record<string, { passwordHash: string; name: string; createdAt: string }> = usersRaw ? JSON.parse(usersRaw) : {};
      const userRecord = users[email.toLowerCase()];
      if (!userRecord) return { success: false, error: 'No account found with this email.' };
      if (userRecord.passwordHash !== hashPassword(password)) return { success: false, error: 'Incorrect password.' };

      const u: User = { email: email.toLowerCase(), name: userRecord.name, createdAt: userRecord.createdAt };
      localStorage.setItem(SESSION_KEY, JSON.stringify(u));
      setUser(u);
      loadHistory(u.email);
      return { success: true };
    } catch {
      return { success: false, error: 'Login failed.' };
    }
  };

  const signup = (email: string, password: string, name: string) => {
    try {
      if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };
      const usersRaw = localStorage.getItem(USERS_KEY);
      const users: Record<string, { passwordHash: string; name: string; createdAt: string }> = usersRaw ? JSON.parse(usersRaw) : {};
      if (users[email.toLowerCase()]) return { success: false, error: 'An account with this email already exists.' };

      users[email.toLowerCase()] = { passwordHash: hashPassword(password), name, createdAt: new Date().toISOString() };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      const u: User = { email: email.toLowerCase(), name, createdAt: new Date().toISOString() };
      localStorage.setItem(SESSION_KEY, JSON.stringify(u));
      setUser(u);
      setHistory([]);
      return { success: true };
    } catch {
      return { success: false, error: 'Signup failed.' };
    }
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setHistory([]);
  };

  const addToHistory = useCallback((result: any) => {
    if (!user) return;
    const entry: HistoryEntry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      fileName: result.fileName || 'unknown.vcf',
      uploadedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + ONE_WEEK_MS).toISOString(),
      totalVariants: result.totalVariants || 0,
      pharmacogeneCount: result.pharmacogenes?.length || 0,
      grade: result.judgingCriteria?.grade || 'N/A',
      overallRisk: result.riskAssessment?.overallRisk || 'unknown',
      reliability: result.accuracyMetrics?.overallReliability?.value || 0,
      summary: `${result.totalVariants || 0} variants, ${result.pharmacogenes?.length || 0} pharmacogenes, Grade ${result.judgingCriteria?.grade || 'N/A'}, ${(result.riskAssessment?.overallRisk || 'unknown').toUpperCase()} risk`,
      result,
    };
    const updated = [entry, ...history];
    saveHistory(user.email, updated);
  }, [user, history, saveHistory]);

  const deleteFromHistory = useCallback((id: string) => {
    if (!user) return;
    const updated = history.filter(e => e.id !== id);
    saveHistory(user.email, updated);
  }, [user, history, saveHistory]);

  const clearExpired = useCallback(() => {
    if (!user) return 0;
    const now = Date.now();
    const valid = history.filter(e => new Date(e.expiresAt).getTime() > now);
    const removed = history.length - valid.length;
    // Only update state if something was actually removed to prevent infinite re-render loops
    if (removed > 0) {
      saveHistory(user.email, valid);
    }
    return removed;
  }, [user, history, saveHistory]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, history, addToHistory, deleteFromHistory, clearExpired }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
