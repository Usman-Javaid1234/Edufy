import Layout from "../components/Layout";
import { grades } from "../data/mockData";
import { Download, TrendingUp, Award, BookOpen } from "lucide-react";

export default function Grades() {
  const gpa = 3.92;
  const totalCredits = 104;

  return (
    <Layout allowedRoles={["student"]}>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Academic Record</p>
            <h1 className="text-2xl font-bold text-white">Grades & Transcript</h1>
          </div>
          <button className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
            <Download size={15} /> Download Official Transcript
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-navy-800 border border-navy-600 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-gold-400" />
              <p className="text-slate-400 text-xs uppercase tracking-wider">Cumulative GPA</p>
            </div>
            <p className="text-3xl font-bold text-white">{gpa}</p>
            <p className="text-gold-400 text-xs mt-1">↑ Top 5% of Class</p>
          </div>
          <div className="bg-navy-800 border border-navy-600 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={16} className="text-blue-400" />
              <p className="text-slate-400 text-xs uppercase tracking-wider">Total Credits</p>
            </div>
            <p className="text-3xl font-bold text-white">{totalCredits}</p>
            <p className="text-slate-500 text-xs mt-1">16 Credits Remaining</p>
          </div>
          <div className="bg-gold-500/10 border border-gold-500/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Award size={16} className="text-gold-400" />
              <p className="text-gold-400 text-xs uppercase tracking-wider">Academic Standing</p>
            </div>
            <p className="text-2xl font-bold text-gold-400">Dean's List</p>
            <p className="text-gold-500/70 text-xs mt-1">Fall 2025 Semester</p>
          </div>
        </div>

        {/* Grades table */}
        <div className="bg-navy-800 border border-navy-600 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-navy-600">
            <h2 className="text-white font-semibold">Current Semester Grades</h2>
            <div className="flex gap-2">
              {["Spring 2026", "Fall 2025"].map((s, i) => (
                <button key={s} className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
                  i === 0 ? "border-gold-500/40 text-gold-400 bg-gold-500/10" : "border-navy-500 text-slate-400 hover:text-white"
                }`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-navy-600/50">
            {grades.map((g, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-navy-700/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    g.grade.startsWith("A") ? "bg-green-900/30 text-green-400 border border-green-800/40" :
                    g.grade.startsWith("B") ? "bg-gold-500/10 text-gold-400 border border-gold-500/20" :
                    "bg-red-900/20 text-red-400 border border-red-800/40"
                  }`}>{g.grade}</div>
                  <div>
                    <p className="text-white text-sm font-semibold">{g.courseCode} — {g.courseTitle}</p>
                    <p className="text-slate-500 text-xs">{g.grader}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs">Credits / Points</p>
                  <p className="text-white text-sm font-semibold">{g.credits} / {g.points}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
