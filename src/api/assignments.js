import api from "./axios";

export const assignmentsApi = {
  getMyAssignments: () =>
    api.get("/assignments/"),

  getAssignment: (id) =>
    api.get(`/assignments/${id}/`),

  createAssignment: (data) =>
    api.post("/assignments/", data),

  submitAssignment: (id, formData) =>
    api.post(`/assignments/${id}/submit/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getSubmissions: (assignmentId) =>
    api.get(`/assignments/${assignmentId}/submissions/`),

  getSubmission: (submissionId) =>
    api.get(`/assignments/submissions/${submissionId}/`),
};
