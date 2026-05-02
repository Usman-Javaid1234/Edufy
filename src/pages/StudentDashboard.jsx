import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { courses, assignments, grades, notifications } from "../data/mockData";
import { BookOpen, ClipboardList, Star, Bell, TrendingUp, AlertTriangle, Clock } from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-navy-800 border border-navy-600 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-slate-400 text-sm mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gold-400 mt-1">{sub}</p>}
    </div>
  );
}

function CourseCard({ course }) {
  return (
    <div className="bg-navy-700/50 border border-navy-600 rounded-xl p-4 hover:border-gold-500/30 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-gold-400 bg-gold-500/10 border border-gold-500/20 rounded-md px-2 py-0.5">
          {course.code}
        </span>
        <span className="text-xs text-slate-400">{course.progress}%</span>
      </div>
      <h3 className="text-white text-sm font-semibold mb-1 leading-snug">{course.title}</h3>
      <p className="text-slate-500 text-xs mb-3">{course.instructor}</p>
      <div className="w-full bg-navy-600 rounded-full h-1.5">
        <div
          className="bg-gold-500 h-1.5 rounded-full transition-all"
          style={{ width: `${course.progress}%` }}
        />
      </div>
    </div>
  );
}

function AssignmentRow({ a }) {
  const isOverdue = a.status === "overdue";
  const deadline = new Date(a.deadline);
  const diff = deadline - new Date();
  const hoursLeft = Math.abs(Math.round(diff / 3600000));

  return (
    <div className="flex items-center justify-between py-3 border-b border-navy-600/50 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full shrink-0 ${
          isOverdue ? "bg-red-400" : a.status === "submitted" ? "bg-green-400" : "bg-gold-400"
        }`} />
        <div>
          <p className="text-white text-sm font-medium">{a.title}</p>
          <p className="text-slate-500 text-xs">{a.courseCode}</p>
        </div>
      </div>
      <div className="text-right shrink-0 ml-4">
        {isOverdue ? (
          <span className="text-red-400 text-xs font-medium">{hoursLeft}h overdue</span>
        ) : a.status === "submitted" ? (
          <span className="text-green-400 text-xs font-medium">Submitted</span>
        ) : (
          <span className="text-slate-400 text-xs">Due in {hoursLeft}h</span>
        )}
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const unread = notifications.filter(n => !n.read).length;

  const gpa = 3.8;
  const pendingCount = assignments.filter(a => a.status === "upcoming").length;
  const overdueCount = assignments.filter(a => a.status === "overdue").length;

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
          <div className="relative">
            <button className="w-10 h-10 bg-navy-800 border border-navy-600 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <Bell size={18} />
            </button>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                {unread}
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-7">
          <StatCard icon={BookOpen}     label="Enrolled Courses"    value={courses.length}   sub="+1 this term"        color="bg-blue-500/15 text-blue-400" />
          <StatCard icon={ClipboardList} label="Pending Assignments" value={pendingCount}     sub={`${overdueCount} overdue`} color="bg-gold-500/15 text-gold-400" />
          <StatCard icon={TrendingUp}   label="Average Grade"       value={`${gpa} GPA`}     sub="Top 5% of class"     color="bg-green-500/15 text-green-400" />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Courses */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">My Courses</h2>
              <button onClick={() => navigate("/courses")} className="text-gold-400 text-xs hover:text-gold-300">View All →</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {courses.map(c => <CourseCard key={c.id} course={c} />)}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Upcoming */}
            <div className="bg-navy-800 border border-navy-600 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white text-sm font-semibold">Upcoming Tasks</h3>
                <Clock size={14} className="text-slate-500" />
              </div>
              {assignments.map(a => <AssignmentRow key={a.id} a={a} />)}
            </div>

            {/* Grades summary */}
            <div className="bg-navy-800 border border-navy-600 rounded-xl p-4">
              <h3 className="text-white text-sm font-semibold mb-3">Recent Grades</h3>
              {grades.slice(0, 3).map((g, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-navy-600/40 last:border-0">
                  <div>
                    <p className="text-white text-xs font-medium">{g.courseCode}</p>
                    <p className="text-slate-500 text-xs">{g.credits} cr</p>
                  </div>
                  <span className={`text-sm font-bold ${
                    g.grade.startsWith("A") ? "text-green-400" :
                    g.grade.startsWith("B") ? "text-gold-400" : "text-red-400"
                  }`}>{g.grade}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
