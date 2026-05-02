import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import Assignments from "./pages/Assignments";
import SubmitAssignment from "./pages/SubmitAssignment";
import Grades from "./pages/Grades";
import CourseCatalog from "./pages/CourseCatalog";
import FacultyDashboard from "./pages/FacultyDashboard";
import FacultyCourses from "./pages/FacultyCourses";
import GradingPanel from "./pages/GradingPanel";
import AdminUsers from "./pages/AdminUsers";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login"                  element={<Login />} />
          <Route path="/dashboard"              element={<StudentDashboard />} />
          <Route path="/courses"                element={<CourseCatalog />} />
          <Route path="/assignments"            element={<Assignments />} />
          <Route path="/assignments/:id/submit" element={<SubmitAssignment />} />
          <Route path="/grades"                 element={<Grades />} />
          <Route path="/faculty"                element={<FacultyDashboard />} />
          <Route path="/faculty/courses"        element={<FacultyCourses />} />
          <Route path="/faculty/grading"        element={<GradingPanel />} />
          <Route path="/admin/users"            element={<AdminUsers />} />
          <Route path="*"                       element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
