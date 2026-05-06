import {
  clearStoredSession,
  getStoredSession,
  saveStoredSession,
} from "./session";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "https://localhost:7156/api"
).replace(/\/$/, "");

let refreshPromise = null;

function buildUrl(path) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function parseResponseBody(response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (response.status === 204) {
    return null;
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : null;
}

function extractValidationErrors(payload) {
  if (!payload?.errors || typeof payload.errors !== "object") {
    return [];
  }

  return Object.values(payload.errors)
    .flatMap((value) => (Array.isArray(value) ? value : []))
    .filter(Boolean);
}

function extractErrorMessage(payload, fallbackMessage) {
  const validationMessages = extractValidationErrors(payload);

  if (validationMessages.length > 0) {
    return validationMessages.join(" ");
  }

  return (
    payload?.message ??
    payload?.Message ??
    payload?.title ??
    fallbackMessage
  );
}

function createApiError(response, payload) {
  const error = new Error(
    extractErrorMessage(payload, "Beklenmeyen bir API hatasi olustu."),
  );

  error.status = response.status;
  error.payload = payload;
  return error;
}

async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  const currentSession = getStoredSession();
  if (!currentSession?.refreshToken) {
    return null;
  }

  refreshPromise = (async () => {
    const response = await fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        refreshToken: currentSession.refreshToken,
      }),
    });

    const payload = await parseResponseBody(response);

    if (!response.ok) {
      clearStoredSession();
      throw createApiError(response, payload);
    }

    const nextSession = {
      ...currentSession,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      accessTokenExpiresAtUtc: payload.accessTokenExpiresAtUtc ?? null,
      refreshTokenExpiresAtUtc: payload.refreshTokenExpiresAtUtc ?? null,
      role: payload.role ?? currentSession.role ?? null,
    };

    saveStoredSession(nextSession);
    return nextSession;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function apiRequest(
  path,
  { method = "GET", body, headers = {}, auth = true, skipRefresh = false } = {},
) {
  const currentSession = getStoredSession();
  const requestHeaders = {
    Accept: "application/json",
    ...headers,
  };

  let requestBody = body;
  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  if (auth && currentSession?.accessToken) {
    requestHeaders.Authorization = `Bearer ${currentSession.accessToken}`;
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers: requestHeaders,
    body: requestBody,
  });

  if (response.status === 401 && auth && !skipRefresh && currentSession?.refreshToken) {
    try {
      const nextSession = await refreshAccessToken();
      if (nextSession?.accessToken) {
        return apiRequest(path, {
          method,
          body,
          headers,
          auth,
          skipRefresh: true,
        });
      }
    } catch (refreshError) {
      clearStoredSession();
      throw refreshError;
    }
  }

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    throw createApiError(response, payload);
  }

  return payload;
}
