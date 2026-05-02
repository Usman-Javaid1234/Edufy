import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { courses, assignments, submissions } from "../data/mockData";
import { ClipboardList, Users, BookOpen, Bell, Clock, ChevronRight, FileText } from "lucide-react";

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

export default function FacultyDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const myCourses   = courses.filter(c => c.instructor === currentUser.name);
  const pendingSubs = submissions.filter(s => s.grade === null);
  const gradedSubs  = submissions.filter(s => s.grade !== null);

  return (
    <Layout allowedRoles={["faculty"]}>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold text-white">Faculty Console</h1>
            <p className="text-slate-400 text-sm mt-1">Manage your courses and grade submissions.</p>
          </div>
          <div className="w-10 h-10 bg-navy-800 border border-navy-600 rounded-xl flex items-center justify-center text-slate-400 hover:text-white cursor-pointer transition-colors">
            <Bell size={18} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-7">
          <StatCard icon={BookOpen}     label="Active Courses"       value={courses.length}      sub="This semester"       color="bg-blue-500/15 text-blue-400" />
          <StatCard icon={ClipboardList} label="Pending Reviews"     value={pendingSubs.length}  sub="Awaiting grading"    color="bg-gold-500/15 text-gold-400" />
          <StatCard icon={Users}        label="Total Students"       value={42}                  sub="Across all courses"  color="bg-purple-500/15 text-purple-400" />
          <StatCard icon={FileText}     label="Graded This Week"     value={gradedSubs.length}   sub="Completed"           color="bg-green-500/15 text-green-400" />
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Course Creation Panel */}
          <div className="col-span-3 space-y-5">
            <div className="bg-navy-800 border border-navy-600 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">Course Creation</h2>
                <span className="text-xs text-slate-500">Draft and publish new offerings</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1.5">Course Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Advanced Meta-Physics"
                    className="w-full bg-navy-700 border border-navy-500 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1.5">Department Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CS-401"
                    className="w-full bg-navy-700 border border-navy-500 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1.5">Syllabus Overview</label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe the course objectives..."
                    className="w-full bg-navy-700 border border-navy-500 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-gold-500 transition-colors resize-none"
                  />
                </div>
                {/* Upload zone */}
                <div className="border-2 border-dashed border-navy-500 hover:border-gold-500/40 rounded-xl p-6 text-center cursor-pointer transition-colors">
                  <FileText size={22} className="mx-auto text-slate-500 mb-2" />
                  <p className="text-slate-400 text-sm font-medium">Upload Syllabus (PDF, DOCX)</p>
                  <p className="text-slate-600 text-xs mt-0.5">Drag and drop or click to browse</p>
                </div>
                <button className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold py-2.5 rounded-lg text-sm transition-colors">
                  Publish Course
                </button>
              </div>
            </div>
          </div>

          {/* Grading Station */}
          <div className="col-span-2">
            <div className="bg-navy-800 border border-navy-600 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">Grading Station</h2>
                {pendingSubs.length > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {pendingSubs.length}
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-xs mb-3">Pending reviews</p>
              <div className="space-y-2">
                {submissions.slice(0, 4).map(s => (
                  <button
                    key={s.id}
                    onClick={() => navigate(`/faculty/grading?sub=${s.id}`)}
                    className="w-full flex items-center gap-3 bg-navy-700 hover:bg-navy-600 border border-navy-500 hover:border-gold-500/30 rounded-lg p-3 transition-all text-left group"
                  >
                    <div className="w-8 h-8 bg-navy-600 group-hover:bg-gold-500/10 rounded-lg flex items-center justify-center shrink-0 transition-colors">
                      <FileText size={14} className="text-slate-400 group-hover:text-gold-400 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{s.studentName}</p>
                      <p className="text-slate-500 text-xs">
                        {assignments.find(a => a.id === s.assignmentId)?.title?.slice(0, 28)}…
                      </p>
                      <p className="text-slate-600 text-xs">{s.timestamp ? `Submitted ${new Date(s.timestamp).toLocaleDateString()}` : ""}</p>
                    </div>
                    {s.grade === null
                      ? <span className="text-xs text-gold-400 bg-gold-500/10 border border-gold-500/20 px-2 py-0.5 rounded-md shrink-0">Grade</span>
                      : <span className="text-xs text-green-400 bg-green-900/20 border border-green-800/30 px-2 py-0.5 rounded-md shrink-0">{s.grade}</span>
                    }
                  </button>
                ))}
              </div>
              <button
                onClick={() => navigate("/faculty/grading")}
                className="w-full mt-3 text-slate-400 hover:text-gold-400 text-xs font-medium flex items-center justify-center gap-1 py-2 transition-colors"
              >
                View All Submissions <ChevronRight size={12} />
              </button>
            </div>

            {/* My Courses mini */}
            <div className="bg-navy-800 border border-navy-600 rounded-xl p-5 mt-5">
              <h2 className="text-white font-semibold mb-3">My Courses</h2>
              <div className="space-y-2">
                {courses.slice(0, 3).map(c => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-navy-600/40 last:border-0">
                    <div>
                      <p className="text-white text-xs font-medium">{c.code}</p>
                      <p className="text-slate-500 text-xs">{c.enrolled} students</p>
                    </div>
                    <div className="w-16 bg-navy-600 rounded-full h-1.5">
                      <div className="bg-gold-500 h-1.5 rounded-full" style={{ width: `${c.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
