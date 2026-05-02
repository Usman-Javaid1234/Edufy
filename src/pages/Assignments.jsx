import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { assignments } from "../data/mockData";
import { ClipboardList, Clock, AlertTriangle, CheckCircle, ChevronRight } from "lucide-react";

const tabs = ["All Tasks", "Upcoming", "Submitted", "Overdue"];

function badge(status) {
  if (status === "overdue")   return <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-red-900/40 text-red-400 border border-red-700/40">OVERDUE</span>;
  if (status === "submitted") return <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-green-900/30 text-green-400 border border-green-700/30">SUBMITTED</span>;
  return <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-gold-500/10 text-gold-400 border border-gold-500/20">DUE SOON</span>;
}

function timeLabel(deadline, status) {
  const diff = new Date(deadline) - new Date();
  const hours = Math.abs(Math.round(diff / 3600000));
  const days  = Math.floor(hours / 24);
  if (status === "overdue")   return <span className="text-red-400 text-xs font-medium">Due: {new Date(deadline).toLocaleString("en-US", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })}</span>;
  if (status === "submitted") return <span className="text-green-400 text-xs font-medium">Submitted ✓</span>;
  if (days > 0) return <span className="text-slate-400 text-xs">Due in {days}d {hours % 24}h</span>;
  return <span className="text-gold-400 text-xs font-medium">Due in {hours}h</span>;
}

function actionButton(a, navigate) {
  if (a.status === "overdue")   return <button onClick={() => navigate(`/assignments/${a.id}/submit`)} className="text-xs px-3 py-1.5 rounded-lg border border-red-700/50 text-red-400 hover:bg-red-900/20 transition-colors">Submit Late</button>;
  if (a.status === "submitted") return <button className="text-xs px-3 py-1.5 rounded-lg border border-navy-500 text-slate-400 cursor-default">View Submission</button>;
  return <button onClick={() => navigate(`/assignments/${a.id}/submit`)} className="text-xs px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold transition-colors">Start Draft</button>;
}

export default function Assignments() {
  const [activeTab, setActiveTab] = useState("All Tasks");
  const navigate = useNavigate();

  const filtered = assignments.filter(a => {
    if (activeTab === "Upcoming")  return a.status === "upcoming";
    if (activeTab === "Submitted") return a.status === "submitted";
    if (activeTab === "Overdue")   return a.status === "overdue";
    return true;
  });

  const overdue   = assignments.filter(a => a.status === "overdue");
  const upcoming  = assignments.filter(a => a.status === "upcoming");
  const submitted = assignments.filter(a => a.status === "submitted");

  return (
    <Layout allowedRoles={["student"]}>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Assignments</h1>
          <p className="text-slate-400 text-sm mt-1">Review and manage your scholarly tasks.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Overdue",   count: overdue.length,   icon: AlertTriangle, color: "text-red-400",   bg: "bg-red-900/20 border-red-800/40" },
            { label: "Upcoming",  count: upcoming.length,  icon: Clock,         color: "text-gold-400",  bg: "bg-gold-500/10 border-gold-500/20" },
            { label: "Submitted", count: submitted.length, icon: CheckCircle,   color: "text-green-400", bg: "bg-green-900/20 border-green-800/40" },
          ].map(({ label, count, icon: Icon, color, bg }) => (
            <div key={label} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${bg}`}>
              <Icon size={18} className={color} />
              <div>
                <p className="text-white font-bold text-lg leading-none">{count}</p>
                <p className={`text-xs mt-0.5 ${color}`}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-navy-800 border border-navy-600 rounded-xl p-1 w-fit">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === t
                  ? "bg-gold-500 text-navy-900"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {/* Overdue section */}
          {(activeTab === "All Tasks" || activeTab === "Overdue") && overdue.length > 0 && (
            <div>
              <p className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-2 px-1">Overdue</p>
              {overdue.map(a => (
                <div key={a.id} className="bg-navy-800 border border-red-900/40 rounded-xl p-4 mb-2 hover:border-red-700/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        {badge(a.status)}
                        <span className="text-slate-500 text-xs">{a.courseCode}</span>
                      </div>
                      <h3 className="text-white font-semibold text-sm mb-1">{a.title}</h3>
                      <p className="text-slate-500 text-xs">{a.description.slice(0, 80)}…</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {timeLabel(a.deadline, a.status)}
                      {actionButton(a, navigate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming section */}
          {(activeTab === "All Tasks" || activeTab === "Upcoming") && upcoming.length > 0 && (
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 px-1">Upcoming</p>
              {upcoming.map(a => (
                <div key={a.id} className="bg-navy-800 border border-navy-600 rounded-xl p-4 mb-2 hover:border-gold-500/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        {badge(a.status)}
                        <span className="text-slate-500 text-xs">{a.courseCode}</span>
                      </div>
                      <h3 className="text-white font-semibold text-sm mb-1">{a.title}</h3>
                      <p className="text-slate-500 text-xs">{a.description.slice(0, 80)}…</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {timeLabel(a.deadline, a.status)}
                      {actionButton(a, navigate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Submitted section */}
          {(activeTab === "All Tasks" || activeTab === "Submitted") && submitted.length > 0 && (
            <div>
              <p className="text-green-400 text-xs font-semibold uppercase tracking-wider mb-2 px-1">Submitted</p>
              {submitted.map(a => (
                <div key={a.id} className="bg-navy-800 border border-green-900/30 rounded-xl p-4 mb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        {badge(a.status)}
                        <span className="text-slate-500 text-xs">{a.courseCode}</span>
                      </div>
                      <h3 className="text-white font-semibold text-sm mb-1">{a.title}</h3>
                      <p className="text-slate-500 text-xs">{a.description.slice(0, 80)}…</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {timeLabel(a.deadline, a.status)}
                      {actionButton(a, navigate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <ClipboardList size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No assignments in this category.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
