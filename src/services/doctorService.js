import { apiRequest } from "../lib/api";

export const doctorService = {
  getMyPatients() {
    return apiRequest("/doctorpatients/my-patients");
  },

  getAvailablePatients() {
    return apiRequest("/doctorpatients/available-patients");
  },

  assignPatient(patientId) {
    return apiRequest("/doctorpatients/assign-patient", {
      method: "POST",
      body: {
        patientId,
      },
    });
  },

  removePatient(patientId) {
    return apiRequest(`/doctorpatients/patient/${patientId}`, {
      method: "DELETE",
    });
  },

  getPatientHistory(patientId) {
    return apiRequest(`/doctorpatients/patient/${patientId}/history`);
  },

  createPatientMeasurement(patientId, payload) {
    return apiRequest(`/doctorpatients/patient/${patientId}/measurements`, {
      method: "POST",
      body: payload,
    });
  },
};
