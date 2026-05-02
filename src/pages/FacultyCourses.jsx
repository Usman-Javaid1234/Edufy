import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { coursesApi } from "../api/courses";
import { assignmentsApi } from "../api/assignments";
import { BookOpen, Users, ChevronDown, ChevronUp, Plus, Upload, FileText, CheckCircle, X, AlertTriangle } from "lucide-react";

const ALLOWED_EXT  = ["pdf", "docx"];
const MAX_SIZE_MB   = 50;

function MaterialUpload({ courseId }) {
  const [file, setFile]         = useState(null);
  const [error, setError]       = useState("");
  const [uploaded, setUploaded] = useState([]);
  const [loading, setLoading]   = useState(false);

  const handleFile = (f) => {
    setError("");
    const ext    = f.name.split(".").pop().toLowerCase();
    const sizeMB = f.size / (1024 * 1024);
    if (!ALLOWED_EXT.includes(ext)) { setError("Only PDF and DOCX files are supported."); return; }
    if (sizeMB > MAX_SIZE_MB)       { setError(`File exceeds ${MAX_SIZE_MB} MB limit.`); return; }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("title", file.name.replace(/\.[^.]+$/, ""));
      form.append("file",  file);
      await coursesApi.uploadMaterial(courseId, form);
      setUploaded(prev => [...prev, { name: file.name, size: (file.size / 1024).toFixed(1) + " KB" }]);
      setFile(null);
    } catch (err) {
      const d = err.response?.data;
      setError(d?.file?.[0] || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2 text-xs text-red-300">
          <AlertTriangle size={13} className="shrink-0" /> {error}
        </div>
      )}
      {uploaded.map((f, i) => (
        <div key={i} className="flex items-center gap-2 bg-navy-700 border border-navy-500 rounded-lg px-3 py-2">
          <FileText size={13} className="text-gold-400 shrink-0" />
          <span className="text-white text-xs flex-1 truncate">{f.name}</span>
          <span className="text-slate-500 text-xs">{f.size}</span>
          <CheckCircle size={13} className="text-green-400 shrink-0" />
        </div>
      ))}
      {file && (
        <div className="flex items-center gap-2 bg-navy-700 border border-gold-500/30 rounded-lg px-3 py-2">
          <FileText size={13} className="text-gold-400 shrink-0" />
          <span className="text-white text-xs flex-1 truncate">{file.name}</span>
          <span className="text-slate-500 text-xs">{(file.size / 1024).toFixed(1)} KB</span>
          <button onClick={() => setFile(null)} className="text-slate-500 hover:text-red-400 transition-colors"><X size={13} /></button>
        </div>
      )}
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-navy-500 hover:border-gold-500/40 rounded-xl p-5 cursor-pointer transition-colors text-center">
        <Upload size={20} className="text-slate-500 mb-2" />
        <p className="text-slate-400 text-xs font-medium">Drop file or click to browse</p>
        <p className="text-slate-600 text-xs mt-0.5">PDF, DOCX · Max 50 MB</p>
        <input type="file" accept=".pdf,.docx" className="hidden" onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />
      </label>
      <button onClick={handleUpload} disabled={!file || loading}
        className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-40 disabled:cursor-not-allowed text-navy-900 font-semibold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
      >
        {loading ? <span className="w-3.5 h-3.5 border-2 border-navy-900/40 border-t-navy-900 rounded-full animate-spin" /> : <><Upload size={13} /> Upload Material</>}
      </button>
    </div>
  );
}

function CourseRow({ course, assignments }) {
  const [expanded, setExpanded] = useState(false);
  const courseAssignments = assignments.filter(a => a.course === course.id);

  return (
    <div className="bg-navy-800 border border-navy-600 rounded-xl overflow-hidden mb-3">
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-navy-700/30 transition-colors text-left"
      >
        <div className="w-10 h-10 bg-gold-500/10 border border-gold-500/20 rounded-lg flex items-center justify-center shrink-0">
          <BookOpen size={18} className="text-gold-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs text-gold-400 font-medium">{course.code}</span>
            <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${course.status === "active" ? "bg-green-900/20 text-green-400 border-green-800/30" : "bg-navy-600 text-slate-400 border-navy-500"}`}>
              {course.status}
            </span>
          </div>
          <p className="text-white font-semibold text-sm truncate">{course.title}</p>
        </div>
        <div className="flex items-center gap-6 shrink-0 text-right">
          <div><p className="text-white text-sm font-semibold">{course.enrolled_count || 0}</p><p className="text-slate-500 text-xs">Students</p></div>
          <div><p className="text-white text-sm font-semibold">{courseAssignments.length}</p><p className="text-slate-500 text-xs">Assignments</p></div>
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-navy-600 px-5 py-4 grid grid-cols-2 gap-5">
          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Assignments</h3>
            {courseAssignments.length === 0
              ? <p className="text-slate-500 text-xs">No assignments yet.</p>
              : courseAssignments.map(a => (
                <div key={a.id} className="flex items-center justify-between bg-navy-700 border border-navy-500 rounded-lg px-3 py-2.5 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText size={13} className="text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-white text-xs font-medium truncate">{a.title}</p>
                      <p className="text-slate-500 text-xs">{new Date(a.deadline).toLocaleDateString("en-US", { month:"short", day:"numeric" })}{a.is_past_deadline ? " · Closed" : ""}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-white text-xs font-semibold">{a.submission_count}</p>
                    <p className="text-slate-500 text-xs">subs</p>
                  </div>
                </div>
              ))
            }
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Upload Materials</h3>
            <MaterialUpload courseId={course.id} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function FacultyCourses() {
  const [courses,     setCourses]     = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showCreate,  setShowCreate]  = useState(false);
  const [newCourse,   setNewCourse]   = useState({ title: "", code: "", description: "" });
  const [creating,    setCreating]    = useState(false);
  const [createMsg,   setCreateMsg]   = useState("");

  useEffect(() => {
    Promise.all([coursesApi.getMyCourses(), assignmentsApi.getMyAssignments()])
      .then(([cRes, aRes]) => { setCourses(cRes.data); setAssignments(aRes.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true); setCreateMsg("");
    try {
      await coursesApi.createCourse({ ...newCourse, status: "active" });
      const { data } = await coursesApi.getMyCourses();
      setCourses(data);
      setCreateMsg("Course created successfully!");
      setNewCourse({ title: "", code: "", description: "" });
      setTimeout(() => { setCreateMsg(""); setShowCreate(false); }, 2000);
    } catch (err) {
      const d = err.response?.data;
      setCreateMsg(d?.code?.[0] || d?.title?.[0] || "Failed to create course.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Layout allowedRoles={["faculty"]}>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">My Courses</h1>
            <p className="text-slate-400 text-sm mt-1">Manage your active courses and materials.</p>
          </div>
          <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
            <Plus size={15} /> New Course
          </button>
        </div>

        {showCreate && (
          <div className="bg-navy-800 border border-gold-500/30 rounded-xl p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-sm">Create New Course</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-500 hover:text-white transition-colors"><X size={16} /></button>
            </div>
            {createMsg && (
              <div className={`rounded-lg px-4 py-2.5 mb-4 text-sm ${createMsg.includes("success") ? "bg-green-900/20 border border-green-700/40 text-green-300" : "bg-red-900/20 border border-red-700/40 text-red-300"}`}>
                {createMsg}
              </div>
            )}
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1.5">Course Title</label>
                <input required value={newCourse.title} onChange={e => setNewCourse(p => ({...p, title: e.target.value}))} placeholder="e.g. Advanced Algorithm Design" className="w-full bg-navy-700 border border-navy-500 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-gold-500 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1.5">Course Code</label>
                <input required value={newCourse.code} onChange={e => setNewCourse(p => ({...p, code: e.target.value}))} placeholder="e.g. CS-401" className="w-full bg-navy-700 border border-navy-500 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-gold-500 transition-colors" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1.5">Description</label>
                <textarea rows={2} value={newCourse.description} onChange={e => setNewCourse(p => ({...p, description: e.target.value}))} placeholder="Brief course overview..." className="w-full bg-navy-700 border border-navy-500 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-gold-500 transition-colors resize-none" />
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-navy-500 hover:border-navy-400 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={creating} className="px-4 py-2 text-sm bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-navy-900 font-semibold rounded-lg transition-colors">
                  {creating ? "Creating…" : "Publish Course"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Active Courses",    value: courses.filter(c => c.status === "active").length, color: "text-green-400" },
            { label: "Total Students",    value: courses.reduce((s, c) => s + (c.enrolled_count || 0), 0), color: "text-blue-400" },
            { label: "Total Assignments", value: assignments.length, color: "text-gold-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-navy-800 border border-navy-600 rounded-xl px-4 py-3 flex items-center gap-3">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-slate-400 text-sm">{label}</p>
            </div>
          ))}
        </div>

        {loading
          ? <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-navy-600 border-t-gold-400 rounded-full animate-spin" /></div>
          : courses.map(c => <CourseRow key={c.id} course={c} assignments={assignments} />)
        }
        {!loading && courses.length === 0 && <p className="text-center text-slate-500 py-16 text-sm">No courses yet. Create your first one above.</p>}
      </div>
    </Layout>
  );
}
