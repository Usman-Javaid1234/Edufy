import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { assignmentsApi } from "../api/assignments";
import { Upload, FileText, X, CheckCircle, AlertTriangle, Clock, ArrowLeft } from "lucide-react";

const ALLOWED_EXT  = ["pdf", "docx", "zip"];
const MAX_SIZE_MB   = 50;

export default function SubmitAssignment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef  = useRef();

  const [assignment, setAssignment] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [file,       setFile]       = useState(null);
  const [dragOver,   setDragOver]   = useState(false);
  const [error,      setError]      = useState("");
  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    assignmentsApi.getAssignment(id)
      .then(({ data }) => setAssignment(data))
      .catch(() => setError("Assignment not found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <Layout allowedRoles={["student"]}>
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-navy-600 border-t-gold-400 rounded-full animate-spin" />
      </div>
    </Layout>
  );

  if (!assignment) return (
    <Layout allowedRoles={["student"]}>
      <div className="p-8 text-slate-400 text-sm">Assignment not found.</div>
    </Layout>
  );

  const isPastDeadline = assignment.is_past_deadline;
  const deadline       = new Date(assignment.deadline);
  const diff           = Math.abs(deadline - new Date());
  const hoursLeft      = Math.round(diff / 3600000);

  const validateFile = (f) => {
    const ext    = f.name.split(".").pop().toLowerCase();
    const sizeMB = f.size / (1024 * 1024);
    if (!ALLOWED_EXT.includes(ext))
      return "Unsupported file format. Please upload a PDF, DOCX, or ZIP file.";
    if (sizeMB > MAX_SIZE_MB)
      return `File size exceeds the ${MAX_SIZE_MB} MB limit. Please upload a smaller file.`;
    return null;
  };

  const handleFile = (f) => {
    setError("");
    const err = validateFile(f);
    if (err) { setError(err); setFile(null); return; }
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!file) { setError("Please upload a file before submitting."); return; }
    if (isPastDeadline) { setError("Deadline has passed. Late submissions are not accepted."); return; }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("file", file);
      await assignmentsApi.submitAssignment(id, form);
      setSubmitted(true);
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.file?.[0] || data?.error || "Submission failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return (
    <Layout allowedRoles={["student"]}>
      <div className="p-6 max-w-2xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-900/30 border border-green-700/40 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Submission Successful!</h2>
          <p className="text-slate-400 text-sm mb-1">Your assignment has been submitted.</p>
          <p className="text-slate-500 text-xs mb-1">File: <span className="text-white">{file.name}</span></p>
          <p className="text-slate-500 text-xs mb-6">Timestamp: <span className="text-white">{new Date().toLocaleString()}</span></p>
          <div className="bg-green-900/20 border border-green-800/40 rounded-xl p-4 mb-6 text-left">
            <p className="text-green-400 text-sm font-medium mb-1">✓ Submission recorded</p>
            <p className="text-slate-400 text-xs">Status updated to <span className="text-white font-medium">Submitted</span>. Your faculty has been notified.</p>
          </div>
          <button onClick={() => navigate("/assignments")} className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
            Back to Assignments
          </button>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout allowedRoles={["student"]}>
      <div className="p-6 max-w-2xl mx-auto">
        <button onClick={() => navigate("/assignments")} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-5 transition-colors">
          <ArrowLeft size={15} /> Back to Assignments
        </button>

        {/* Assignment info */}
        <div className="bg-navy-800 border border-navy-600 rounded-xl p-5 mb-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs text-gold-400 bg-gold-500/10 border border-gold-500/20 rounded-md px-2 py-0.5 font-medium">{assignment.course_code}</span>
              <h1 className="text-xl font-bold text-white mt-2 mb-1">{assignment.title}</h1>
              <p className="text-slate-400 text-sm">{assignment.description}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-slate-500 text-xs">Max Marks</p>
              <p className="text-white font-bold text-lg">{assignment.max_marks}</p>
            </div>
          </div>
          <div className={`flex items-center gap-3 mt-4 rounded-lg px-4 py-3 ${isPastDeadline ? "bg-red-900/30 border border-red-700/40" : "bg-navy-700 border border-navy-500"}`}>
            {isPastDeadline ? <AlertTriangle size={16} className="text-red-400 shrink-0" /> : <Clock size={16} className="text-gold-400 shrink-0" />}
            <div>
              <p className={`text-sm font-medium ${isPastDeadline ? "text-red-300" : "text-white"}`}>
                {isPastDeadline ? "Deadline Passed" : `Due in ${hoursLeft} hours`}
              </p>
              <p className="text-slate-400 text-xs">{deadline.toLocaleString("en-US", { weekday:"short", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })}</p>
            </div>
          </div>
        </div>

        {isPastDeadline && (
          <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-4 mb-5 flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-semibold text-sm">Deadline has passed. Late submissions are not accepted.</p>
              <p className="text-slate-400 text-xs mt-1">Contact your instructor if you require an extension.</p>
            </div>
          </div>
        )}

        {/* Upload */}
        <div className="bg-navy-800 border border-navy-600 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-1">Upload Submission</h2>
          <p className="text-slate-500 text-xs mb-4">Accepted formats: PDF, DOCX, ZIP · Max size: 50 MB</p>

          {error && (
            <div className="flex items-start gap-3 bg-red-900/30 border border-red-700/40 rounded-lg px-4 py-3 mb-4 text-sm">
              <AlertTriangle size={15} className="text-red-400 mt-0.5 shrink-0" />
              <span className="text-red-300">{error}</span>
            </div>
          )}

          {!file ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              onClick={() => fileRef.current.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${dragOver ? "border-gold-500 bg-gold-500/5" : "border-navy-500 hover:border-gold-500/50 hover:bg-navy-700/30"}`}
            >
              <Upload size={28} className="mx-auto text-slate-500 mb-3" />
              <p className="text-white text-sm font-medium">Drag & drop your file here</p>
              <p className="text-slate-500 text-xs mt-1">or click to browse</p>
              <input ref={fileRef} type="file" accept=".pdf,.docx,.zip" className="hidden" onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-navy-700 border border-navy-500 rounded-xl p-4">
              <div className="w-10 h-10 bg-gold-500/15 rounded-lg flex items-center justify-center shrink-0">
                <FileText size={20} className="text-gold-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{file.name}</p>
                <p className="text-slate-400 text-xs">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              <button onClick={() => { setFile(null); setError(""); }} className="text-slate-500 hover:text-red-400 transition-colors">
                <X size={16} />
              </button>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!file || submitting || isPastDeadline}
            className="w-full mt-4 bg-gold-500 hover:bg-gold-600 disabled:opacity-40 disabled:cursor-not-allowed text-navy-900 font-semibold py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? <span className="inline-block w-4 h-4 border-2 border-navy-900/40 border-t-navy-900 rounded-full animate-spin" /> : "Submit Assignment"}
          </button>
          {isPastDeadline && <p className="text-center text-red-400 text-xs mt-2">Submissions are closed for this assignment.</p>}
        </div>
      </div>
    </Layout>
  );
}
