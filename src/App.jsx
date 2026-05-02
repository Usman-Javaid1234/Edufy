import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import Assignments from "./pages/Assignments";
import SubmitAssignment from "./pages/SubmitAssignment";
import Grades from "./pages/Grades";
import FacultyDashboard from "./pages/FacultyDashboard";
import FacultyCourses from "./pages/FacultyCourses";
import GradingPanel from "./pages/GradingPanel";
import Layout from "./components/Layout";

const Placeholder = ({ title }) => (
  <div className="flex-1 flex items-center justify-center text-slate-400 text-sm p-10">
    <div className="text-center">
      <p className="text-2xl mb-2">🚧</p>
      <p className="font-medium text-white">{title}</p>
      <p className="text-slate-500 text-xs mt-1">Coming soon</p>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/assignments/:id/submit" element={<SubmitAssignment />} />
          <Route path="/grades" element={<Grades />} />
          <Route path="/courses" element={<Layout allowedRoles={["student"]}><Placeholder title="Course Catalog" /></Layout>} />
          <Route path="/faculty" element={<FacultyDashboard />} />
          <Route path="/faculty/courses" element={<FacultyCourses />} />
          <Route path="/faculty/grading" element={<GradingPanel />} />
          <Route path="/admin/users" element={<Layout allowedRoles={["admin"]}><Placeholder title="User Management" /></Layout>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
