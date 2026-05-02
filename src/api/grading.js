import api from "./axios";

export const gradingApi = {
  getMyGrades: () =>
    api.get("/grading/my-grades/"),

  getCourseGrades: (courseId) =>
    api.get(`/grading/course/${courseId}/`),

  getGrade: (submissionId) =>
    api.get(`/grading/submission/${submissionId}/`),

  saveGrade: (submissionId, data) =>
    api.post(`/grading/submission/${submissionId}/`, data),

  publishGrade: (submissionId) =>
    api.post(`/grading/submission/${submissionId}/publish/`),

  getRubric: (assignmentId) =>
    api.get(`/grading/assignment/${assignmentId}/rubric/`),

  createRubric: (assignmentId, data) =>
    api.post(`/grading/assignment/${assignmentId}/rubric/`, data),
};
