import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { coursesApi } from "../api/courses";
import { assignmentsApi } from "../api/assignments";
import { gradingApi } from "../api/grading";
import { BookOpen, ClipboardList, TrendingUp, Bell, Clock, AlertTriangle } from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-navy-800 border border-navy-600 rounded-xl p-5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-slate-400 text-sm mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gold-400 mt-1">{sub}</p>}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-navy-600 border-t-gold-400 rounded-full animate-spin" />
    </div>
  );
}

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const navigate        = useNavigate();

  const [courses,     setCourses]     = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [grades,      setGrades]      = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      coursesApi.getMyCourses(),
      assignmentsApi.getMyAssignments(),
      gradingApi.getMyGrades(),
    ])
      .then(([cRes, aRes, gRes]) => {
        setCourses(cRes.data);
        setAssignments(aRes.data);
        setGrades(gRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pending  = assignments.filter(a => a.student_status === "upcoming").length;
  const overdue  = assignments.filter(a => a.student_status === "overdue").length;
  const gpa      = grades.length
    ? (grades.reduce((s, g) => s + (g.numerical_grade / g.max_marks) * 4, 0) / grades.length).toFixed(1)
    : "—";

  return (
    <Layout allowedRoles={["student"]}>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {currentUser.name.split(" ")[0]}!
            </h1>
            <p className="text-slate-400 text-sm mt-1">Your academic summary for the Fall Semester.</p>
          </div>
          <div className="w-10 h-10 bg-navy-800 border border-navy-600 rounded-xl flex items-center justify-center text-slate-400">
            <Bell size={18} />
          </div>
        </div>

        {loading ? <Spinner /> : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-7">
              <StatCard icon={BookOpen}      label="Enrolled Courses"    value={courses.length}  sub="+1 this term"           color="bg-blue-500/15 text-blue-400" />
              <StatCard icon={ClipboardList} label="Pending Assignments" value={pending}          sub={overdue > 0 ? `${overdue} overdue` : "All on track"} color="bg-gold-500/15 text-gold-400" />
              <StatCard icon={TrendingUp}    label="Average Grade"       value={`${gpa} GPA`}     sub="Based on graded work"   color="bg-green-500/15 text-green-400" />
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Courses */}
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold">My Courses</h2>
                  <button onClick={() => navigate("/courses")} className="text-gold-400 text-xs hover:text-gold-300">View All →</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {courses.map(c => (
                    <div key={c.id} className="bg-navy-700/50 border border-navy-600 rounded-xl p-4 hover:border-gold-500/30 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-medium text-gold-400 bg-gold-500/10 border border-gold-500/20 rounded-md px-2 py-0.5">{c.code}</span>
                      </div>
                      <h3 className="text-white text-sm font-semibold mb-1 leading-snug">{c.title}</h3>
                      <p className="text-slate-500 text-xs">{c.instructor_name}</p>
                    </div>
                  ))}
                  {courses.length === 0 && (
                    <p className="text-slate-500 text-sm col-span-2">No enrolled courses yet.</p>
                  )}
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-5">
                {/* Upcoming tasks */}
                <div className="bg-navy-800 border border-navy-600 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white text-sm font-semibold">Upcoming Tasks</h3>
                    <Clock size={14} className="text-slate-500" />
                  </div>
                  {assignments.slice(0, 5).map(a => {
                    const isOverdue = a.student_status === "overdue";
                    const diff = Math.abs(new Date(a.deadline) - new Date());
                    const hrs  = Math.round(diff / 3600000);
                    return (
                      <div key={a.id} className="flex items-center justify-between py-2.5 border-b border-navy-600/40 last:border-0">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${isOverdue ? "bg-red-400" : a.student_status === "submitted" ? "bg-green-400" : "bg-gold-400"}`} />
                          <div>
                            <p className="text-white text-xs font-medium leading-snug">{a.title.slice(0, 30)}{a.title.length > 30 ? "…" : ""}</p>
                            <p className="text-slate-500 text-xs">{a.course_code}</p>
                          </div>
                        </div>
                        <span className={`text-xs shrink-0 ml-2 ${isOverdue ? "text-red-400" : "text-slate-400"}`}>
                          {isOverdue ? `${hrs}h late` : a.student_status === "submitted" ? "✓" : `${hrs}h`}
                        </span>
                      </div>
                    );
                  })}
                  {assignments.length === 0 && <p className="text-slate-500 text-xs">No assignments yet.</p>}
                </div>

                {/* Recent grades */}
                <div className="bg-navy-800 border border-navy-600 rounded-xl p-4">
                  <h3 className="text-white text-sm font-semibold mb-3">Recent Grades</h3>
                  {grades.slice(0, 3).map((g, i) => {
                    const pct = Math.round((g.numerical_grade / g.max_marks) * 100);
                    return (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-navy-600/40 last:border-0">
                        <div>
                          <p className="text-white text-xs font-medium">{g.assignment_title?.slice(0, 22)}…</p>
                          <p className="text-slate-500 text-xs">{g.numerical_grade}/{g.max_marks}</p>
                        </div>
                        <span className={`text-sm font-bold ${pct >= 80 ? "text-green-400" : pct >= 60 ? "text-gold-400" : "text-red-400"}`}>
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                  {grades.length === 0 && <p className="text-slate-500 text-xs">No grades released yet.</p>}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
