import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { gradingApi } from "../api/grading";
import { Download, TrendingUp, BookOpen, Award } from "lucide-react";

function Spinner() {
  return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-navy-600 border-t-gold-400 rounded-full animate-spin" /></div>;
}

export default function Grades() {
  const [grades,  setGrades]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gradingApi.getMyGrades()
      .then(({ data }) => setGrades(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const gpa = grades.length
    ? (grades.reduce((s, g) => s + (g.numerical_grade / g.max_marks) * 4, 0) / grades.length).toFixed(2)
    : "—";

  const totalCredits = grades.length * 3;

  return (
    <Layout allowedRoles={["student"]}>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Academic Record</p>
            <h1 className="text-2xl font-bold text-white">Grades & Transcript</h1>
          </div>
          <button className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
            <Download size={15} /> Download Transcript
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-navy-800 border border-navy-600 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2"><TrendingUp size={16} className="text-gold-400" /><p className="text-slate-400 text-xs uppercase tracking-wider">Cumulative GPA</p></div>
            <p className="text-3xl font-bold text-white">{gpa}</p>
            <p className="text-gold-400 text-xs mt-1">↑ Based on graded work</p>
          </div>
          <div className="bg-navy-800 border border-navy-600 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2"><BookOpen size={16} className="text-blue-400" /><p className="text-slate-400 text-xs uppercase tracking-wider">Total Credits</p></div>
            <p className="text-3xl font-bold text-white">{totalCredits}</p>
            <p className="text-slate-500 text-xs mt-1">{grades.length} graded assignments</p>
          </div>
          <div className="bg-gold-500/10 border border-gold-500/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2"><Award size={16} className="text-gold-400" /><p className="text-gold-400 text-xs uppercase tracking-wider">Academic Standing</p></div>
            <p className="text-2xl font-bold text-gold-400">{parseFloat(gpa) >= 3.5 ? "Dean's List" : parseFloat(gpa) >= 2.0 ? "Good Standing" : "—"}</p>
            <p className="text-gold-500/70 text-xs mt-1">Spring 2026 Semester</p>
          </div>
        </div>

        {/* Grades table */}
        <div className="bg-navy-800 border border-navy-600 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-navy-600">
            <h2 className="text-white font-semibold">Released Grades</h2>
          </div>
          {loading ? <Spinner /> : (
            <div className="divide-y divide-navy-600/50">
              {grades.map((g, i) => {
                const pct = Math.round((g.numerical_grade / g.max_marks) * 100);
                return (
                  <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-navy-700/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        pct >= 80 ? "bg-green-900/30 text-green-400 border border-green-800/40" :
                        pct >= 60 ? "bg-gold-500/10 text-gold-400 border border-gold-500/20" :
                        "bg-red-900/20 text-red-400 border border-red-800/40"
                      }`}>{pct}%</div>
                      <div>
                        <p className="text-white text-sm font-semibold">{g.assignment_title}</p>
                        <p className="text-slate-500 text-xs">{g.student_name} · Graded by {g.grader}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-xs">Score</p>
                      <p className="text-white text-sm font-semibold">{g.numerical_grade}/{g.max_marks}</p>
                    </div>
                  </div>
                );
              })}
              {grades.length === 0 && (
                <div className="py-16 text-center text-slate-500 text-sm">No grades released yet.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
