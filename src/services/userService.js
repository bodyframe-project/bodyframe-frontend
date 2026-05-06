import { apiRequest } from "../lib/api";

export const userService = {
  getProfile() {
    return apiRequest("/users/me");
  },

  updateProfile(payload) {
    return apiRequest("/users/me", {
      method: "PUT",
      body: payload,
    });
  },

  changePassword(payload) {
    return apiRequest("/users/change-password", {
      method: "POST",
      body: payload,
    });
  },
};
