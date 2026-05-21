import { apiRequest } from "../lib/api";

export const dependentService = {
  getDependents() {
    return apiRequest("/dependents");
  },

  getDependent(dependentId) {
    return apiRequest(`/dependents/${dependentId}`);
  },

  createDependent(payload) {
    return apiRequest("/dependents", {
      method: "POST",
      body: payload,
    });
  },

  updateDependent(dependentId, payload) {
    return apiRequest(`/dependents/${dependentId}`, {
      method: "PUT",
      body: payload,
    });
  },

  getDependentHistory(dependentId) {
    return apiRequest(`/dependents/${dependentId}/history`);
  },

  createDependentMeasurement(dependentId, payload) {
    return apiRequest(`/dependents/${dependentId}/measurements`, {
      method: "POST",
      body: payload,
    });
  },
};
