import api from "./axios";

export const authApi = {
  login: (email, password) =>
    api.post("/auth/login/", { email, password }),

  me: () =>
    api.get("/auth/me/"),

  getUsers: () =>
    api.get("/auth/users/"),

  createUser: (data) =>
    api.post("/auth/users/", data),

  updateUser: (id, data) =>
    api.patch(`/auth/users/${id}/`, data),

  deactivateUser: (id) =>
    api.delete(`/auth/users/${id}/`),
};
