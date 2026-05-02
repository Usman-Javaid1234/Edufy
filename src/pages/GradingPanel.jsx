import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import { submissions, assignments, rubricCriteria } from "../data/mockData";
import {
  FileText, ChevronLeft, ChevronRight, CheckCircle,
  Save, Send, Star, AlertTriangle, User
} from "lucide-react";

export default function GradingPanel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSub = searchParams.get("sub") || submissions[0]?.id;

  const [selectedId, setSelectedId]     = useState(initialSub);
  const [useRubric, setUseRubric]       = useState(false);
  const [rubricScores, setRubricScores] = useState({});
  const [manualGrade, setManualGrade]   = useState("");
  const [feedback, setFeedback]         = useState("");
  const [savedDraft, setSavedDraft]     = useState(false);
  const [published, setPublished]       = useState(false);
  const [gradeError, setGradeError]     = useState("");

  const selected    = submissions.find(s => s.id === selectedId);
  const assignment  = selected ? assignments.find(a => a.id === selected.assignmentId) : null;

  const rubricTotal = rubricCriteria.reduce((sum, c) => {
    return sum + (parseInt(rubricScores[c.id] || 0));
  }, 0);

  const effectiveGrade = useRubric ? rubricTotal : parseInt(manualGrade || 0);
  const maxMarks = assignment?.maxMarks || 100;

  const handleSaveDraft = () => {
    setSavedDraft(true);
    setPublished(false);
    setTimeout(() => setSavedDraft(false), 3000);
  };

  const handlePublish = () => {
    if (!feedback.trim()) { setGradeError("Written feedback is required before publishing."); return; }
    if (effectiveGrade <= 0) { setGradeError("Please enter a valid grade before publishing."); return; }
    setGradeError("");
    setPublished(true);
    setSavedDraft(false);
  };

  const gradeColor = (g, max) => {
    const pct = (g / max) * 100;
    if (pct >= 80) return "text-green-400";
    if (pct >= 60) return "text-gold-400";
    return "text-red-400";
  };

  return (
    <Layout allowedRoles={["faculty"]}>
      <div className="flex h-screen overflow-hidden">
        {/* ── Left: Submission list ── */}
        <div className="w-64 border-r border-navy-600 bg-navy-800 flex flex-col">
          <div className="p-4 border-b border-navy-600">
            <button
              onClick={() => navigate("/faculty")}
              className="flex items-center gap-2 text-slate-400 hover:text-white text-xs mb-3 transition-colors"
            >
              <ChevronLeft size={14} /> Back to Dashboard
            </button>
            <h2 className="text-white font-semibold text-sm">All Submissions</h2>
            <p className="text-slate-500 text-xs mt-0.5">{submissions.length} total</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {submissions.map(s => {
              const a = assignments.find(x => x.id === s.assignmentId);
              const isActive = s.id === selectedId;
              return (
                <button
                  key={s.id}
                  onClick={() => { setSelectedId(s.id); setPublished(false); setSavedDraft(false); setFeedback(""); setManualGrade(""); setUseRubric(false); setRubricScores({}); }}
                  className={`w-full text-left rounded-lg p-3 transition-all border ${
                    isActive
                      ? "bg-gold-500/10 border-gold-500/30 text-gold-400"
                      : "bg-navy-700/40 border-navy-600/50 hover:border-navy-500 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User size={11} className="shrink-0" />
                    <span className="text-xs font-medium truncate">{s.studentName}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{a?.title?.slice(0, 30)}…</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-slate-600">{s.fileType}</span>
                    {s.grade !== null
                      ? <span className="text-xs text-green-400 font-medium">{s.grade}/{a?.maxMarks}</span>
                      : <span className="text-xs text-gold-400 bg-gold-500/10 px-1.5 py-0.5 rounded">Pending</span>
                    }
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Center: Submission viewer ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selected && assignment ? (
            <>
              {/* Top bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-navy-600 bg-navy-800/80 backdrop-blur-sm">
                <div>
                  <p className="text-white font-semibold text-sm">{selected.studentName}</p>
                  <p className="text-slate-400 text-xs">{assignment.title} · {assignment.courseCode}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Submitted: {new Date(selected.timestamp).toLocaleDateString()}</span>
                  <span className="text-xs bg-navy-700 border border-navy-500 text-slate-300 px-2 py-1 rounded-md">{selected.fileType}</span>
                </div>
              </div>

              {/* File preview mock */}
              <div className="flex-1 overflow-y-auto p-5">
                <div className="bg-navy-800 border border-navy-600 rounded-xl p-6 mb-5 min-h-64 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-navy-700 border border-navy-500 rounded-2xl flex items-center justify-center mb-3">
                    <FileText size={30} className="text-gold-400" />
                  </div>
                  <p className="text-white font-medium text-sm">{selected.fileURL}</p>
                  <p className="text-slate-500 text-xs mt-1">PDF Document · Submitted by {selected.studentName}</p>
                  <button className="mt-4 text-xs text-gold-400 hover:text-gold-300 border border-gold-500/30 px-4 py-1.5 rounded-lg transition-colors">
                    Open File ↗
                  </button>
                </div>

                {/* Published success */}
                {published && (
                  <div className="bg-green-900/20 border border-green-700/40 rounded-xl p-4 mb-4 flex items-start gap-3">
                    <CheckCircle size={18} className="text-green-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-300 font-semibold text-sm">Grade Published Successfully</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Grade <span className="text-white font-bold">{effectiveGrade}/{maxMarks}</span> has been released. {selected.studentName} has been notified.
                      </p>
                    </div>
                  </div>
                )}

                {/* Draft saved */}
                {savedDraft && !published && (
                  <div className="bg-navy-700 border border-navy-500 rounded-xl p-3 mb-4 flex items-center gap-3">
                    <Save size={15} className="text-slate-400" />
                    <p className="text-slate-300 text-sm">Draft saved. Grade not yet visible to student.</p>
                  </div>
                )}

                {/* Error */}
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
              Select a submission to review
            </div>
          )}
        </div>

        {/* ── Right: Grading panel ── */}
        {selected && assignment && (
          <div className="w-80 border-l border-navy-600 bg-navy-800 flex flex-col overflow-y-auto">
            <div className="p-4 border-b border-navy-600">
              <h2 className="text-white font-semibold text-sm">Grading</h2>
              <p className="text-slate-400 text-xs mt-0.5">Max marks: {maxMarks}</p>
            </div>

            <div className="p-4 space-y-4 flex-1">
              {/* Rubric toggle */}
              <div className="flex items-center justify-between bg-navy-700 border border-navy-500 rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-gold-400" />
                  <span className="text-white text-xs font-medium">Use Rubric Template</span>
                </div>
                <button
                  onClick={() => { setUseRubric(!useRubric); setRubricScores({}); setManualGrade(""); }}
                  className={`w-9 h-5 rounded-full transition-colors relative ${useRubric ? "bg-gold-500" : "bg-navy-500"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${useRubric ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
              </div>

              {/* Rubric criteria */}
              {useRubric && (
                <div className="space-y-3">
                  <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">Rubric Criteria</p>
                  {rubricCriteria.map(c => (
                    <div key={c.id} className="bg-navy-700 border border-navy-500 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="text-white text-xs font-medium leading-snug">{c.criterion}</p>
                        <span className="text-slate-500 text-xs shrink-0">/{c.maxPoints}</span>
                      </div>
                      <p className="text-slate-500 text-xs mb-2 leading-relaxed">{c.description}</p>
                      <input
                        type="number"
                        min={0}
                        max={c.maxPoints}
                        value={rubricScores[c.id] || ""}
                        onChange={e => setRubricScores(prev => ({ ...prev, [c.id]: Math.min(c.maxPoints, Math.max(0, parseInt(e.target.value) || 0)) }))}
                        placeholder={`0 – ${c.maxPoints}`}
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
                    <input
                      type="number"
                      min={0}
                      max={maxMarks}
                      value={manualGrade}
                      onChange={e => setManualGrade(Math.min(maxMarks, Math.max(0, parseInt(e.target.value) || "")))}
                      placeholder={`0 – ${maxMarks}`}
                      className="w-full bg-navy-700 border border-navy-500 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold-500 transition-colors pr-16"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">/ {maxMarks}</span>
                  </div>
                  {manualGrade && (
                    <p className={`text-xs mt-1 font-medium ${gradeColor(manualGrade, maxMarks)}`}>
                      {Math.round((manualGrade / maxMarks) * 100)}% — {
                        manualGrade / maxMarks >= 0.8 ? "Excellent" :
                        manualGrade / maxMarks >= 0.6 ? "Satisfactory" : "Needs Improvement"
                      }
                    </p>
                  )}
                </div>
              )}

              {/* Feedback */}
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1.5">
                  Written Feedback <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={5}
                  value={feedback}
                  onChange={e => { setFeedback(e.target.value); setGradeError(""); }}
                  placeholder="Enter your feedback for the student..."
                  className="w-full bg-navy-700 border border-navy-500 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-gold-500 transition-colors resize-none"
                />
              </div>

              {/* Grade preview */}
              {effectiveGrade > 0 && (
                <div className="bg-navy-700 border border-navy-500 rounded-lg px-3 py-2.5 flex items-center justify-between">
                  <span className="text-slate-400 text-xs">Final Grade</span>
                  <span className={`font-bold text-lg ${gradeColor(effectiveGrade, maxMarks)}`}>
                    {effectiveGrade}/{maxMarks}
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="p-4 border-t border-navy-600 space-y-2">
              <button
                onClick={handleSaveDraft}
                disabled={published}
                className="w-full flex items-center justify-center gap-2 border border-navy-500 hover:border-gold-500/40 text-slate-300 hover:text-white py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
              >
                <Save size={14} /> Save as Draft
              </button>
              <button
                onClick={handlePublish}
                disabled={published}
                className="w-full flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 disabled:opacity-40 disabled:cursor-not-allowed text-navy-900 font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                <Send size={14} /> {published ? "Grade Published ✓" : "Save Grade"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
