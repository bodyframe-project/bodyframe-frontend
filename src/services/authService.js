import { apiRequest } from "../lib/api";

export const authService = {
  login(payload) {
    return apiRequest("/auth/login", {
      method: "POST",
      body: payload,
      auth: false,
    });
  },

  register(payload) {
    return apiRequest("/auth/register", {
      method: "POST",
      body: payload,
      auth: false,
    });
  },

  verifyEmail(payload) {
    return apiRequest("/auth/verify-email", {
      method: "POST",
      body: payload,
      auth: false,
    });
  },

  resendVerification(payload) {
    return apiRequest("/auth/resend-verification", {
      method: "POST",
      body: payload,
      auth: false,
    });
  },

  forgotPassword(payload) {
    return apiRequest("/auth/forgot-password", {
      method: "POST",
      body: payload,
      auth: false,
    });
  },

  resetPassword(payload) {
    return apiRequest("/auth/reset-password", {
      method: "POST",
      body: payload,
      auth: false,
    });
  },

  logout(refreshToken) {
    return apiRequest("/auth/logout", {
      method: "POST",
      body: {
        refreshToken,
      },
    });
  },
};
