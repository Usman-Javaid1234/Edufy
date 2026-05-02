import api from "./axios";

export const coursesApi = {
  getMyCourses: () =>
    api.get("/courses/"),

  getCatalog: () =>
    api.get("/courses/catalog/"),

  getCourse: (id) =>
    api.get(`/courses/${id}/`),

  createCourse: (data) =>
    api.post("/courses/", data),

  updateCourse: (id, data) =>
    api.patch(`/courses/${id}/`, data),

  uploadMaterial: (courseId, formData) =>
    api.post(`/courses/${courseId}/materials/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getMaterials: (courseId) =>
    api.get(`/courses/${courseId}/materials/`),

  enroll: (courseId) =>
    api.post(`/courses/${courseId}/enroll/`),

  unenroll: (courseId) =>
    api.delete(`/courses/${courseId}/enroll/`),
};
