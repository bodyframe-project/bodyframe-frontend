import { apiRequest } from "../lib/api";

export const measurementService = {
  getHistory() {
    return apiRequest("/measurements/history");
  },

  calculate(payload) {
    return apiRequest("/measurements/calculate", {
      method: "POST",
      body: payload,
      auth: false,
    });
  },

  create(payload) {
    return apiRequest("/measurements", {
      method: "POST",
      body: payload,
    });
  },
};
