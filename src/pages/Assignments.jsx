import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { assignmentsApi } from "../api/assignments";
import { ClipboardList, Clock, AlertTriangle, CheckCircle } from "lucide-react";

const tabs = ["All Tasks", "Upcoming", "Submitted", "Overdue"];

function badge(status) {
  if (status === "overdue")   return <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-red-900/40 text-red-400 border border-red-700/40">OVERDUE</span>;
  if (status === "submitted" || status === "graded") return <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-green-900/30 text-green-400 border border-green-700/30">SUBMITTED</span>;
  return <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-gold-500/10 text-gold-400 border border-gold-500/20">DUE SOON</span>;
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-navy-600 border-t-gold-400 rounded-full animate-spin" />
    </div>
  );
}

export default function Assignments() {
  const [activeTab, setActiveTab] = useState("All Tasks");
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    assignmentsApi.getMyAssignments()
      .then(({ data }) => setAssignments(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const overdue   = assignments.filter(a => a.student_status === "overdue");
  const upcoming  = assignments.filter(a => a.student_status === "upcoming");
  const submitted = assignments.filter(a => a.student_status === "submitted" || a.student_status === "graded");

  const filtered = activeTab === "Upcoming"  ? upcoming
                 : activeTab === "Submitted" ? submitted
                 : activeTab === "Overdue"   ? overdue
                 : assignments;

  const timeLabel = (a) => {
    const diff = new Date(a.deadline) - new Date();
    const hrs  = Math.abs(Math.round(diff / 3600000));
    const days = Math.floor(hrs / 24);
    if (a.student_status === "overdue")   return <span className="text-red-400 text-xs font-medium">Due: {new Date(a.deadline).toLocaleString("en-US", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })}</span>;
    if (a.student_status === "submitted" || a.student_status === "graded") return <span className="text-green-400 text-xs font-medium">Submitted ✓</span>;
    if (days > 0) return <span className="text-slate-400 text-xs">Due in {days}d {hrs % 24}h</span>;
    return <span className="text-gold-400 text-xs font-medium">Due in {hrs}h</span>;
  };

  const actionButton = (a) => {
    if (a.student_status === "submitted" || a.student_status === "graded")
      return <button className="text-xs px-3 py-1.5 rounded-lg border border-navy-500 text-slate-400 cursor-default">View</button>;
    return (
      <button
        onClick={() => navigate(`/assignments/${a.id}/submit`)}
        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
          a.student_status === "overdue"
            ? "border border-red-700/50 text-red-400 hover:bg-red-900/20"
            : "bg-gold-500 hover:bg-gold-600 text-navy-900"
        }`}
      >
        {a.student_status === "overdue" ? "Submit Late" : "Start Draft"}
      </button>
    );
  };

  const Section = ({ list, label, color }) => list.length === 0 ? null : (
    <div>
      <p className={`text-xs font-semibold uppercase tracking-wider mb-2 px-1 ${color}`}>{label}</p>
      {list.map(a => (
        <div key={a.id} className={`bg-navy-800 border rounded-xl p-4 mb-2 transition-colors ${
          a.student_status === "overdue" ? "border-red-900/40 hover:border-red-700/50"
          : a.student_status === "submitted" || a.student_status === "graded" ? "border-green-900/30"
          : "border-navy-600 hover:border-gold-500/30"
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                {badge(a.student_status)}
                <span className="text-slate-500 text-xs">{a.course_code}</span>
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">{a.title}</h3>
              <p className="text-slate-500 text-xs">{a.description?.slice(0, 80)}…</p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              {timeLabel(a)}
              {actionButton(a)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Layout allowedRoles={["student"]}>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Assignments</h1>
          <p className="text-slate-400 text-sm mt-1">Review and manage your scholarly tasks.</p>
        </div>

        {/* Stats */}
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
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === t ? "bg-gold-500 text-navy-900" : "text-slate-400 hover:text-white"
              }`}
            >{t}</button>
          ))}
        </div>

        {loading ? <Spinner /> : (
          <div className="space-y-3">
            {activeTab === "All Tasks" ? (
              <>
                <Section list={overdue}   label="Overdue"   color="text-red-400" />
                <Section list={upcoming}  label="Upcoming"  color="text-slate-400" />
                <Section list={submitted} label="Submitted" color="text-green-400" />
              </>
            ) : (
              <Section list={filtered} label={activeTab} color="text-slate-400" />
            )}
            {filtered.length === 0 && !loading && (
              <div className="text-center py-16 text-slate-500">
                <ClipboardList size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No assignments in this category.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
