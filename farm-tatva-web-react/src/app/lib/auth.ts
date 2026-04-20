import type { ApiUser } from "./api";

export const SESSION_STORAGE_KEY = "farm-tatva-session";

export interface StoredSession {
  token: string;
  user: ApiUser;
}

export const readStoredSession = (): StoredSession | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(SESSION_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue);

    if (!parsedValue?.token || !parsedValue?.user) {
      return null;
    }

    return parsedValue;
  } catch {
    return null;
  }
};

export const persistSession = (session: StoredSession) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const clearStoredSession = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
};

export const isAdminSession = (session: StoredSession | null) => {
  return !!session?.token && session.user?.role === "ADMIN";
};