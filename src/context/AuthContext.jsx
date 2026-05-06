import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
import { userService } from "../services/userService";
import {
  clearStoredSession,
  getStoredSession,
  savePendingEmail,
  saveStoredSession,
} from "../lib/session";

const AuthContext = createContext(null);

function normalizeSession(authResponse) {
  if (!authResponse?.accessToken || !authResponse?.refreshToken) {
    return null;
  }

  return {
    accessToken: authResponse.accessToken,
    refreshToken: authResponse.refreshToken,
    accessTokenExpiresAtUtc: authResponse.accessTokenExpiresAtUtc ?? null,
    refreshTokenExpiresAtUtc: authResponse.refreshTokenExpiresAtUtc ?? null,
    role: authResponse.role ?? null,
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getStoredSession());
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const storedSession = getStoredSession();

      if (!storedSession?.accessToken) {
        if (!cancelled) {
          setReady(true);
        }
        return;
      }

      try {
        const me = await userService.getProfile();
        if (!cancelled) {
          setProfile(me);
          const latest = getStoredSession();
          setSession(latest);
        }
      } catch (error) {
        clearStoredSession();
        if (!cancelled) {
          setSession(null);
          setProfile(null);
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  async function refreshProfile() {
    const me = await userService.getProfile();
    setProfile(me);

    const currentSession = getStoredSession();
    if (currentSession && me?.role && currentSession.role !== me.role) {
      const nextSession = {
        ...currentSession,
        role: me.role,
      };
      saveStoredSession(nextSession);
      setSession(nextSession);
    }

    return me;
  }

  async function signIn(credentials) {
    const authResponse = await authService.login(credentials);
    const nextSession = normalizeSession(authResponse);

    if (nextSession) {
      saveStoredSession(nextSession);
      setSession(nextSession);
    }

    const me = await refreshProfile();
    return { authResponse, profile: me };
  }

  async function signOut() {
    const currentSession = getStoredSession();

    try {
      if (currentSession?.accessToken) {
        await authService.logout(currentSession.refreshToken);
      }
    } finally {
      clearStoredSession();
      setSession(null);
      setProfile(null);
    }
  }

  async function afterPasswordChange() {
    clearStoredSession();
    setSession(null);
    setProfile(null);
  }

  function handleRegistrationResult(authResponse, fallbackEmail) {
    if (fallbackEmail) {
      savePendingEmail(fallbackEmail);
    }

    if (authResponse?.requiresEmailVerification && fallbackEmail) {
      savePendingEmail(fallbackEmail);
    }

    return authResponse;
  }

  const value = {
    ready,
    session,
    profile,
    isAuthenticated: Boolean(session?.accessToken),
    signIn,
    signOut,
    refreshProfile,
    afterPasswordChange,
    handleRegistrationResult,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
