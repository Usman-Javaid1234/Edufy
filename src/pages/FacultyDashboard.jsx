import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { coursesApi } from "../api/courses";
import { assignmentsApi } from "../api/assignments";
import { ClipboardList, Users, BookOpen, Bell, FileText, ChevronRight } from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-navy-800 border border-navy-600 rounded-xl p-5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}><Icon size={18} /></div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-slate-400 text-sm mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gold-400 mt-1">{sub}</p>}
    </div>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-navy-600 border-t-gold-400 rounded-full animate-spin" /></div>;
}

export default function FacultyDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [courses,      setCourses]      = useState([]);
  const [assignments,  setAssignments]  = useState([]);
  const [allSubs,      setAllSubs]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [newCourse,    setNewCourse]    = useState({ title: "", code: "", description: "" });
  const [creating,     setCreating]     = useState(false);
  const [createMsg,    setCreateMsg]    = useState("");

  useEffect(() => {
    Promise.all([
      coursesApi.getMyCourses(),
      assignmentsApi.getMyAssignments(),
    ])
      .then(async ([cRes, aRes]) => {
        setCourses(cRes.data);
        setAssignments(aRes.data);
        // Fetch submissions for all assignments
        const subPromises = aRes.data.map(a =>
          assignmentsApi.getSubmissions(a.id).then(r => r.data).catch(() => [])
        );
        const subsNested = await Promise.all(subPromises);
        setAllSubs(subsNested.flat());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pendingSubs = allSubs.filter(s => s.status === "submitted");
  const totalStudents = courses.reduce((s, c) => s + (c.enrolled_count || 0), 0);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateMsg("");
    try {
      await coursesApi.createCourse({ ...newCourse, status: "active" });
      setCreateMsg("Course created successfully!");
      setNewCourse({ title: "", code: "", description: "" });
      const { data } = await coursesApi.getMyCourses();
      setCourses(data);
    } catch (err) {
      const d = err.response?.data;
      setCreateMsg(d?.code?.[0] || d?.title?.[0] || "Failed to create course.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Layout allowedRoles={["faculty"]}>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold text-white">Faculty Console</h1>
            <p className="text-slate-400 text-sm mt-1">Manage your courses and grade submissions.</p>
          </div>
          <div className="w-10 h-10 bg-navy-800 border border-navy-600 rounded-xl flex items-center justify-center text-slate-400">
            <Bell size={18} />
          </div>
        </div>

        {loading ? <Spinner /> : (
          <>
            <div className="grid grid-cols-4 gap-4 mb-7">
              <StatCard icon={BookOpen}      label="Active Courses"   value={courses.length}        sub="This semester"      color="bg-blue-500/15 text-blue-400" />
              <StatCard icon={ClipboardList} label="Pending Reviews"  value={pendingSubs.length}    sub="Awaiting grading"   color="bg-gold-500/15 text-gold-400" />
              <StatCard icon={Users}         label="Total Students"   value={totalStudents}         sub="Across all courses" color="bg-purple-500/15 text-purple-400" />
              <StatCard icon={FileText}      label="Total Submissions" value={allSubs.length}       sub="All time"           color="bg-green-500/15 text-green-400" />
            </div>

            <div className="grid grid-cols-5 gap-6">
              {/* Course creation */}
              <div className="col-span-3">
                <div className="bg-navy-800 border border-navy-600 rounded-xl p-5">
                  <h2 className="text-white font-semibold mb-4">Course Creation</h2>
                  {createMsg && (
                    <div className={`rounded-lg px-4 py-2.5 mb-4 text-sm ${createMsg.includes("success") ? "bg-green-900/20 border border-green-700/40 text-green-300" : "bg-red-900/20 border border-red-700/40 text-red-300"}`}>
                      {createMsg}
                    </div>
                  )}
                  <form onSubmit={handleCreateCourse} className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1.5">Course Title</label>
                      <input required value={newCourse.title} onChange={e => setNewCourse(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Advanced Meta-Physics" className="w-full bg-navy-700 border border-navy-500 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-gold-500 transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1.5">Course Code</label>
                      <input required value={newCourse.code} onChange={e => setNewCourse(p => ({ ...p, code: e.target.value }))} placeholder="e.g. PHY-401" className="w-full bg-navy-700 border border-navy-500 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-gold-500 transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1.5">Syllabus Overview</label>
                      <textarea rows={3} value={newCourse.description} onChange={e => setNewCourse(p => ({ ...p, description: e.target.value }))} placeholder="Briefly describe the course objectives..." className="w-full bg-navy-700 border border-navy-500 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-gold-500 transition-colors resize-none" />
                    </div>
                    <button type="submit" disabled={creating} className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-navy-900 font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                      {creating ? <span className="w-4 h-4 border-2 border-navy-900/40 border-t-navy-900 rounded-full animate-spin" /> : "Publish Course"}
                    </button>
                  </form>
                </div>
              </div>

              {/* Grading station */}
              <div className="col-span-2 space-y-5">
                <div className="bg-navy-800 border border-navy-600 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-white font-semibold">Grading Station</h2>
                    {pendingSubs.length > 0 && <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{pendingSubs.length}</span>}
                  </div>
                  <p className="text-slate-500 text-xs mb-3">Pending reviews</p>
                  <div className="space-y-2">
                    {allSubs.slice(0, 4).map(s => (
                      <button key={s.id} onClick={() => navigate(`/faculty/grading?sub=${s.id}`)}
                        className="w-full flex items-center gap-3 bg-navy-700 hover:bg-navy-600 border border-navy-500 hover:border-gold-500/30 rounded-lg p-3 transition-all text-left group"
                      >
                        <div className="w-8 h-8 bg-navy-600 group-hover:bg-gold-500/10 rounded-lg flex items-center justify-center shrink-0 transition-colors">
                          <FileText size={14} className="text-slate-400 group-hover:text-gold-400 transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate">{s.student_name}</p>
                          <p className="text-slate-500 text-xs truncate">{s.assignment_title?.slice(0, 28)}…</p>
                        </div>
                        {s.status === "graded"
                          ? <span className="text-xs text-green-400 bg-green-900/20 border border-green-800/30 px-2 py-0.5 rounded-md shrink-0">Graded</span>
                          : <span className="text-xs text-gold-400 bg-gold-500/10 border border-gold-500/20 px-2 py-0.5 rounded-md shrink-0">Grade</span>
                        }
                      </button>
                    ))}
                    {allSubs.length === 0 && <p className="text-slate-500 text-xs text-center py-4">No submissions yet.</p>}
                  </div>
                  <button onClick={() => navigate("/faculty/grading")} className="w-full mt-3 text-slate-400 hover:text-gold-400 text-xs font-medium flex items-center justify-center gap-1 py-2 transition-colors">
                    View All <ChevronRight size={12} />
                  </button>
                </div>

                {/* My courses mini */}
                <div className="bg-navy-800 border border-navy-600 rounded-xl p-5">
                  <h2 className="text-white font-semibold mb-3">My Courses</h2>
                  {courses.slice(0, 3).map(c => (
                    <div key={c.id} className="flex items-center justify-between py-2 border-b border-navy-600/40 last:border-0">
                      <div>
                        <p className="text-white text-xs font-medium">{c.code}</p>
                        <p className="text-slate-500 text-xs">{c.enrolled_count || 0} students</p>
                      </div>
                    </div>
                  ))}
                  {courses.length === 0 && <p className="text-slate-500 text-xs">No courses yet.</p>}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
