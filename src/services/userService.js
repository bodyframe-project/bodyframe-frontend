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

  getUsers() {
    return apiRequest("/users");
  },

  createUser(payload) {
    return apiRequest("/users", {
      method: "POST",
      body: payload,
    });
  },

  updateUser(userId, payload) {
    return apiRequest(`/users/${userId}`, {
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
