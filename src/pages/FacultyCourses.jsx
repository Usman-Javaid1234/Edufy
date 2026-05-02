import { useState } from "react";
import Layout from "../components/Layout";
import { courses, assignments, submissions } from "../data/mockData";
import {
  BookOpen, Users, Clock, ChevronDown, ChevronUp,
  Plus, Upload, FileText, CheckCircle, X, AlertTriangle
} from "lucide-react";

const ALLOWED_EXT = ["pdf", "docx"];
const MAX_SIZE_MB = 50;

function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${
      status === "active"
        ? "bg-green-900/20 text-green-400 border-green-800/30"
        : "bg-navy-600 text-slate-400 border-navy-500"
    }`}>
      {status === "active" ? "Active" : "Archived"}
    </span>
  );
}

function CourseRow({ course, expanded, onToggle }) {
  const courseAssignments = assignments.filter(a => a.courseId === course.id);
  const courseSubs = submissions.filter(s =>
    courseAssignments.some(a => a.id === s.assignmentId)
  );
  const pending = courseSubs.filter(s => s.grade === null).length;

  return (
    <div className="bg-navy-800 border border-navy-600 rounded-xl overflow-hidden mb-3">
      {/* Header row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-navy-700/30 transition-colors text-left"
      >
        <div className="w-10 h-10 bg-gold-500/10 border border-gold-500/20 rounded-lg flex items-center justify-center shrink-0">
          <BookOpen size={18} className="text-gold-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs text-gold-400 font-medium">{course.code}</span>
            <StatusBadge status={course.status} />
          </div>
          <p className="text-white font-semibold text-sm truncate">{course.title}</p>
        </div>
        <div className="flex items-center gap-6 shrink-0 text-right">
          <div>
            <p className="text-white text-sm font-semibold">{course.enrolled}</p>
            <p className="text-slate-500 text-xs">Students</p>
          </div>
          <div>
            <p className="text-white text-sm font-semibold">{courseAssignments.length}</p>
            <p className="text-slate-500 text-xs">Assignments</p>
          </div>
          <div>
            <p className={`text-sm font-semibold ${pending > 0 ? "text-gold-400" : "text-slate-400"}`}>{pending}</p>
            <p className="text-slate-500 text-xs">Pending</p>
          </div>
          <div className="w-16">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Progress</span>
              <span>{course.progress}%</span>
            </div>
            <div className="w-full bg-navy-600 rounded-full h-1.5">
              <div className="bg-gold-500 h-1.5 rounded-full" style={{ width: `${course.progress}%` }} />
            </div>
          </div>
          {expanded
            ? <ChevronUp size={16} className="text-slate-400" />
            : <ChevronDown size={16} className="text-slate-400" />
          }
        </div>
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t border-navy-600 px-5 py-4 grid grid-cols-2 gap-5">
          {/* Assignments list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white text-sm font-semibold">Assignments</h3>
              <button className="flex items-center gap-1.5 text-xs text-gold-400 hover:text-gold-300 border border-gold-500/30 hover:border-gold-500/50 px-2.5 py-1 rounded-lg transition-colors">
                <Plus size={12} /> New
              </button>
            </div>
            {courseAssignments.length === 0 ? (
              <p className="text-slate-500 text-xs">No assignments yet.</p>
            ) : (
              <div className="space-y-2">
                {courseAssignments.map(a => {
                  const isPast = new Date() > new Date(a.deadline);
                  const subCount = submissions.filter(s => s.assignmentId === a.id).length;
                  return (
                    <div key={a.id} className="flex items-center justify-between bg-navy-700 border border-navy-500 rounded-lg px-3 py-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText size={13} className="text-slate-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-white text-xs font-medium truncate">{a.title}</p>
                          <p className="text-slate-500 text-xs flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(a.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            {isPast && <span className="text-red-400 ml-1">· Closed</span>}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-white text-xs font-semibold">{subCount}</p>
                        <p className="text-slate-500 text-xs">subs</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upload materials */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Course Materials</h3>
            <MaterialUpload courseId={course.id} />
          </div>
        </div>
      )}
    </div>
  );
}

function MaterialUpload({ courseId }) {
  const [file, setFile]         = useState(null);
  const [error, setError]       = useState("");
  const [uploaded, setUploaded] = useState([]);
  const [loading, setLoading]   = useState(false);

  const handleFile = (f) => {
    setError("");
    const ext = f.name.split(".").pop().toLowerCase();
    const sizeMB = f.size / (1024 * 1024);
    if (!ALLOWED_EXT.includes(ext)) {
      setError("Only PDF and DOCX files are supported.");
      return;
    }
    if (sizeMB > MAX_SIZE_MB) {
      setError(`File exceeds ${MAX_SIZE_MB} MB limit.`);
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setUploaded(prev => [...prev, { name: file.name, size: (file.size / 1024).toFixed(1) + " KB" }]);
    setFile(null);
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2 text-xs text-red-300">
          <AlertTriangle size={13} className="shrink-0" /> {error}
        </div>
      )}

      {/* Previously uploaded */}
      {uploaded.map((f, i) => (
        <div key={i} className="flex items-center gap-2 bg-navy-700 border border-navy-500 rounded-lg px-3 py-2">
          <FileText size={13} className="text-gold-400 shrink-0" />
          <span className="text-white text-xs flex-1 truncate">{f.name}</span>
          <span className="text-slate-500 text-xs">{f.size}</span>
          <CheckCircle size={13} className="text-green-400 shrink-0" />
        </div>
      ))}

      {/* Selected file */}
      {file && (
        <div className="flex items-center gap-2 bg-navy-700 border border-gold-500/30 rounded-lg px-3 py-2">
          <FileText size={13} className="text-gold-400 shrink-0" />
          <span className="text-white text-xs flex-1 truncate">{file.name}</span>
          <span className="text-slate-500 text-xs">{(file.size / 1024).toFixed(1)} KB</span>
          <button onClick={() => setFile(null)} className="text-slate-500 hover:text-red-400 transition-colors">
            <X size={13} />
          </button>
        </div>
      )}

      {/* Drop zone */}
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-navy-500 hover:border-gold-500/40 rounded-xl p-5 cursor-pointer transition-colors text-center">
        <Upload size={20} className="text-slate-500 mb-2" />
        <p className="text-slate-400 text-xs font-medium">Drop file or click to browse</p>
        <p className="text-slate-600 text-xs mt-0.5">PDF, DOCX · Max 50 MB</p>
        <input
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); }}
        />
      </label>

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-40 disabled:cursor-not-allowed text-navy-900 font-semibold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
      >
        {loading
          ? <span className="w-3.5 h-3.5 border-2 border-navy-900/40 border-t-navy-900 rounded-full animate-spin" />
          : <><Upload size={13} /> Upload Material</>
        }
      </button>
    </div>
  );
}

export default function FacultyCourses() {
  const [expandedId, setExpandedId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newCourse, setNewCourse]   = useState({ title: "", code: "", description: "" });
  const [created, setCreated]       = useState(false);

  const toggle = (id) => setExpandedId(prev => prev === id ? null : id);

  const handleCreate = async (e) => {
    e.preventDefault();
    await new Promise(r => setTimeout(r, 600));
    setCreated(true);
    setTimeout(() => { setCreated(false); setShowCreate(false); setNewCourse({ title: "", code: "", description: "" }); }, 2000);
  };

  return (
    <Layout allowedRoles={["faculty"]}>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">My Courses</h1>
            <p className="text-slate-400 text-sm mt-1">Manage your active courses and materials.</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <Plus size={15} /> New Course
          </button>
        </div>

        {/* Create course form */}
        {showCreate && (
          <div className="bg-navy-800 border border-gold-500/30 rounded-xl p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-sm">Create New Course</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            {created ? (
              <div className="flex items-center gap-3 bg-green-900/20 border border-green-700/40 rounded-lg px-4 py-3">
                <CheckCircle size={16} className="text-green-400" />
                <p className="text-green-300 text-sm font-medium">Course created and published successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1.5">Course Title</label>
                  <input
                    required
                    value={newCourse.title}
                    onChange={e => setNewCourse(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Advanced Algorithm Design"
                    className="w-full bg-navy-700 border border-navy-500 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1.5">Course Code</label>
                  <input
                    required
                    value={newCourse.code}
                    onChange={e => setNewCourse(p => ({ ...p, code: e.target.value }))}
                    placeholder="e.g. CS-401"
                    className="w-full bg-navy-700 border border-navy-500 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1.5">Description</label>
                  <textarea
                    rows={2}
                    value={newCourse.description}
                    onChange={e => setNewCourse(p => ({ ...p, description: e.target.value }))}
                    placeholder="Brief course overview..."
                    className="w-full bg-navy-700 border border-navy-500 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-gold-500 transition-colors resize-none"
                  />
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-navy-500 hover:border-navy-400 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 text-sm bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold rounded-lg transition-colors">
                    Publish Course
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Active Courses",    value: courses.filter(c => c.status === "active").length,  color: "text-green-400" },
            { label: "Total Students",    value: courses.reduce((s, c) => s + c.enrolled, 0),         color: "text-blue-400"  },
            { label: "Total Assignments", value: assignments.length,                                   color: "text-gold-400"  },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-navy-800 border border-navy-600 rounded-xl px-4 py-3 flex items-center gap-3">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-slate-400 text-sm">{label}</p>
            </div>
          ))}
        </div>

        {/* Course list */}
        <div>
          {courses.map(c => (
            <CourseRow
              key={c.id}
              course={c}
              expanded={expandedId === c.id}
              onToggle={() => toggle(c.id)}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}
