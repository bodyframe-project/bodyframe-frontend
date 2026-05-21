import { apiRequest } from "../lib/api";

export const doctorService = {
  getMyPatients() {
    return apiRequest("/doctorpatients/my-patients");
  },

  searchAvailablePatients(nationalId) {
    return apiRequest(
      `/doctorpatients/available-patients?nationalId=${encodeURIComponent(nationalId)}`,
    );
  },

  lookupFamilyByNationalId(nationalId) {
    return apiRequest(
      `/doctorpatients/family-lookup?nationalId=${encodeURIComponent(nationalId)}`,
    );
  },

  createPatientRecord(payload) {
    return apiRequest("/doctorpatients/patient-records", {
      method: "POST",
      body: payload,
    });
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
