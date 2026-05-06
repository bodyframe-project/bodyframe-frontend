const SESSION_KEY = "bodyframe.session";
const PENDING_EMAIL_KEY = "bodyframe.pending-email";

export function getStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(SESSION_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

export function saveStoredSession(session) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
}

export function savePendingEmail(email) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PENDING_EMAIL_KEY, email);
}

export function getPendingEmail() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(PENDING_EMAIL_KEY) ?? "";
}

export function clearPendingEmail() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PENDING_EMAIL_KEY);
}
