import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import { assignmentsApi } from "../api/assignments";
import { gradingApi } from "../api/grading";
import { FileText, ChevronLeft, CheckCircle, Save, Send, Star, AlertTriangle, User } from "lucide-react";

function Spinner() {
  return <div className="flex items-center justify-center py-10"><div className="w-7 h-7 border-2 border-navy-600 border-t-gold-400 rounded-full animate-spin" /></div>;
}

export default function GradingPanel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [submissions,   setSubmissions]   = useState([]);
  const [selectedId,    setSelectedId]    = useState(null);
  const [rubric,        setRubric]        = useState(null);
  const [useRubric,     setUseRubric]     = useState(false);
  const [rubricScores,  setRubricScores]  = useState({});
  const [manualGrade,   setManualGrade]   = useState("");
  const [feedback,      setFeedback]      = useState("");
  const [saving,        setSaving]        = useState(false);
  const [savedDraft,    setSavedDraft]    = useState(false);
  const [published,     setPublished]     = useState(false);
  const [gradeError,    setGradeError]    = useState("");
  const [loading,       setLoading]       = useState(true);

  // Load all submissions across all assignments
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data: assignments } = await assignmentsApi.getMyAssignments();
        const subArrays = await Promise.all(
          assignments.map(a => assignmentsApi.getSubmissions(a.id).then(r => r.data).catch(() => []))
        );
        const all = subArrays.flat();
        setSubmissions(all);
        const fromQuery = searchParams.get("sub");
        setSelectedId(fromQuery || all[0]?.id || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const selected = submissions.find(s => String(s.id) === String(selectedId));

  // Load rubric when selected changes
  useEffect(() => {
    if (!selected) return;
    setUseRubric(false); setRubricScores({}); setManualGrade(""); setFeedback(""); setSavedDraft(false); setPublished(false); setGradeError("");
    gradingApi.getRubric(selected.assignment)
      .then(({ data }) => setRubric(data))
      .catch(() => setRubric(null));
  }, [selectedId]);

  const rubricTotal = rubric?.criteria?.reduce((s, c) => s + (parseInt(rubricScores[c.id] || 0)), 0) || 0;
  const effectiveGrade = useRubric ? rubricTotal : parseInt(manualGrade || 0);
  const maxMarks = selected?.grade?.max_marks || 100;

  const gradeColor = (g, max) => {
    const pct = (g / max) * 100;
    return pct >= 80 ? "text-green-400" : pct >= 60 ? "text-gold-400" : "text-red-400";
  };

  const handleSave = async (publish) => {
    if (!feedback.trim()) { setGradeError("Written feedback is required."); return; }
    if (effectiveGrade <= 0) { setGradeError("Please enter a valid grade."); return; }
    setGradeError(""); setSaving(true);
    try {
      const payload = {
        numerical_grade:  effectiveGrade,
        written_feedback: feedback,
        publish,
        rubric_scores: useRubric && rubric
          ? rubric.criteria.map(c => ({ criterion_id: c.id, score: parseInt(rubricScores[c.id] || 0) }))
          : [],
      };
      await gradingApi.saveGrade(selected.id, payload);
      if (publish) setPublished(true);
      else { setSavedDraft(true); setTimeout(() => setSavedDraft(false), 3000); }
    } catch (err) {
      const d = err.response?.data;
      setGradeError(d?.written_feedback?.[0] || d?.numerical_grade?.[0] || d?.non_field_errors?.[0] || "Failed to save grade.");
    } finally {
      setSaving(false);
    }
  };

  const selectSub = (id) => {
    setSelectedId(id);
    setSavedDraft(false); setPublished(false); setGradeError("");
  };

  return (
    <Layout allowedRoles={["faculty"]}>
      <div className="flex h-screen overflow-hidden">
        {/* Left: submission list */}
        <div className="w-64 border-r border-navy-600 bg-navy-800 flex flex-col">
          <div className="p-4 border-b border-navy-600">
            <button onClick={() => navigate("/faculty")} className="flex items-center gap-2 text-slate-400 hover:text-white text-xs mb-3 transition-colors">
              <ChevronLeft size={14} /> Back to Dashboard
            </button>
            <h2 className="text-white font-semibold text-sm">All Submissions</h2>
            <p className="text-slate-500 text-xs mt-0.5">{submissions.length} total</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {loading ? <Spinner /> : submissions.map(s => (
              <button key={s.id} onClick={() => selectSub(s.id)}
                className={`w-full text-left rounded-lg p-3 transition-all border ${
                  String(s.id) === String(selectedId)
                    ? "bg-gold-500/10 border-gold-500/30 text-gold-400"
                    : "bg-navy-700/40 border-navy-600/50 hover:border-navy-500 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <User size={11} className="shrink-0" />
                  <span className="text-xs font-medium truncate">{s.student_name}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{s.assignment_title?.slice(0, 28)}…</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-slate-600">{s.file_type}</span>
                  {s.status === "graded"
                    ? <span className="text-xs text-green-400 font-medium">Graded</span>
                    : <span className="text-xs text-gold-400 bg-gold-500/10 px-1.5 py-0.5 rounded">Pending</span>
                  }
                </div>
              </button>
            ))}
            {!loading && submissions.length === 0 && <p className="text-slate-500 text-xs text-center pt-4">No submissions yet.</p>}
          </div>
        </div>

        {/* Center: file view */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selected ? (
            <>
              <div className="flex items-center justify-between px-5 py-3 border-b border-navy-600 bg-navy-800/80">
                <div>
                  <p className="text-white font-semibold text-sm">{selected.student_name}</p>
                  <p className="text-slate-400 text-xs">{selected.assignment_title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Submitted: {new Date(selected.timestamp).toLocaleDateString()}</span>
                  <span className="text-xs bg-navy-700 border border-navy-500 text-slate-300 px-2 py-1 rounded-md">{selected.file_type}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                {/* File preview mock */}
                <div className="bg-navy-800 border border-navy-600 rounded-xl p-6 mb-5 min-h-52 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-navy-700 border border-navy-500 rounded-2xl flex items-center justify-center mb-3">
                    <FileText size={30} className="text-gold-400" />
                  </div>
                  <p className="text-white font-medium text-sm">{selected.file_name}</p>
                  <p className="text-slate-500 text-xs mt-1">{selected.file_type} · {selected.file_size_mb} MB</p>
                  {selected.file_url && (
                    <a href={selected.file_url} target="_blank" rel="noreferrer" className="mt-4 text-xs text-gold-400 hover:text-gold-300 border border-gold-500/30 px-4 py-1.5 rounded-lg transition-colors">
                      Open File ↗
                    </a>
                  )}
                </div>

                {published && (
                  <div className="bg-green-900/20 border border-green-700/40 rounded-xl p-4 mb-4 flex items-start gap-3">
                    <CheckCircle size={18} className="text-green-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-300 font-semibold text-sm">Grade Published Successfully</p>
                      <p className="text-slate-400 text-xs mt-0.5">Grade <span className="text-white font-bold">{effectiveGrade}</span> released. {selected.student_name} has been notified.</p>
                    </div>
                  </div>
                )}
                {savedDraft && !published && (
                  <div className="bg-navy-700 border border-navy-500 rounded-xl p-3 mb-4 flex items-center gap-3">
                    <Save size={15} className="text-slate-400" />
                    <p className="text-slate-300 text-sm">Draft saved. Not yet visible to student.</p>
                  </div>
                )}
                {gradeError && (
                  <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-3 mb-4 flex items-center gap-3">
                    <AlertTriangle size={15} className="text-red-400" />
                    <p className="text-red-300 text-sm">{gradeError}</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
              {loading ? <Spinner /> : "Select a submission to review"}
            </div>
          )}
        </div>

        {/* Right: grading controls */}
        {selected && (
          <div className="w-80 border-l border-navy-600 bg-navy-800 flex flex-col overflow-y-auto">
            <div className="p-4 border-b border-navy-600">
              <h2 className="text-white font-semibold text-sm">Grading</h2>
              <p className="text-slate-400 text-xs mt-0.5">Max marks: {maxMarks}</p>
            </div>
            <div className="p-4 space-y-4 flex-1">
              {/* Rubric toggle */}
              {rubric && (
                <div className="flex items-center justify-between bg-navy-700 border border-navy-500 rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-gold-400" />
                    <span className="text-white text-xs font-medium">Use Rubric Template</span>
                  </div>
                  <button onClick={() => { setUseRubric(!useRubric); setRubricScores({}); setManualGrade(""); }}
                    className={`w-9 h-5 rounded-full transition-colors relative ${useRubric ? "bg-gold-500" : "bg-navy-500"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${useRubric ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </div>
              )}

              {/* Rubric criteria */}
              {useRubric && rubric && (
                <div className="space-y-3">
                  <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">Rubric Criteria</p>
                  {rubric.criteria.map(c => (
                    <div key={c.id} className="bg-navy-700 border border-navy-500 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="text-white text-xs font-medium leading-snug">{c.criterion}</p>
                        <span className="text-slate-500 text-xs shrink-0">/{c.max_points}</span>
                      </div>
                      <p className="text-slate-500 text-xs mb-2">{c.description}</p>
                      <input type="number" min={0} max={c.max_points}
                        value={rubricScores[c.id] || ""}
                        onChange={e => setRubricScores(prev => ({ ...prev, [c.id]: Math.min(c.max_points, Math.max(0, parseInt(e.target.value) || 0)) }))}
                        placeholder={`0 – ${c.max_points}`}
                        className="w-full bg-navy-600 border border-navy-400 rounded-md px-3 py-1.5 text-white text-xs focus:outline-none focus:border-gold-500 transition-colors"
                      />
                    </div>
                  ))}
                  <div className="flex items-center justify-between bg-gold-500/10 border border-gold-500/20 rounded-lg px-3 py-2">
                    <span className="text-gold-400 text-xs font-medium">Auto-calculated Total</span>
                    <span className={`font-bold text-sm ${gradeColor(rubricTotal, maxMarks)}`}>{rubricTotal}/{maxMarks}</span>
                  </div>
                </div>
              )}

              {/* Manual grade */}
              {!useRubric && (
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1.5">Numerical Grade</label>
                  <div className="relative">
                    <input type="number" min={0} max={maxMarks} value={manualGrade}
                      onChange={e => setManualGrade(Math.min(maxMarks, Math.max(0, parseInt(e.target.value) || "")))}
                      placeholder={`0 – ${maxMarks}`}
                      className="w-full bg-navy-700 border border-navy-500 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold-500 transition-colors pr-16"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">/ {maxMarks}</span>
                  </div>
                  {manualGrade > 0 && (
                    <p className={`text-xs mt-1 font-medium ${gradeColor(manualGrade, maxMarks)}`}>
                      {Math.round((manualGrade / maxMarks) * 100)}% — {manualGrade / maxMarks >= 0.8 ? "Excellent" : manualGrade / maxMarks >= 0.6 ? "Satisfactory" : "Needs Improvement"}
                    </p>
                  )}
                </div>
              )}

              {/* Feedback */}
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1.5">Written Feedback <span className="text-red-400">*</span></label>
                <textarea rows={5} value={feedback} onChange={e => { setFeedback(e.target.value); setGradeError(""); }}
                  placeholder="Enter your feedback for the student..."
                  className="w-full bg-navy-700 border border-navy-500 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-gold-500 transition-colors resize-none"
                />
              </div>

              {effectiveGrade > 0 && (
                <div className="flex items-center justify-between bg-navy-700 border border-navy-500 rounded-lg px-3 py-2.5">
                  <span className="text-slate-400 text-xs">Final Grade</span>
                  <span className={`font-bold text-lg ${gradeColor(effectiveGrade, maxMarks)}`}>{effectiveGrade}/{maxMarks}</span>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="p-4 border-t border-navy-600 space-y-2">
              <button onClick={() => handleSave(false)} disabled={saving || published}
                className="w-full flex items-center justify-center gap-2 border border-navy-500 hover:border-gold-500/40 text-slate-300 hover:text-white py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
              >
                <Save size={14} /> Save as Draft
              </button>
              <button onClick={() => handleSave(true)} disabled={saving || published}
                className="w-full flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 disabled:opacity-40 disabled:cursor-not-allowed text-navy-900 font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                {saving
                  ? <span className="w-4 h-4 border-2 border-navy-900/40 border-t-navy-900 rounded-full animate-spin" />
                  : <><Send size={14} /> {published ? "Grade Published ✓" : "Save Grade"}</>
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
