import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { authApi } from "../api/auth";
import {
  Users, Search, Plus, X, CheckCircle, AlertTriangle,
  Shield, GraduationCap, BookOpen, ChevronDown, Edit2,
  UserX, UserCheck, RefreshCw
} from "lucide-react";

const ROLES = ["student", "faculty", "admin"];
const DEPARTMENTS = ["CS", "EE", "SE", "HUM", "IT", "MATH", "PHY"];

function Spinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-navy-600 border-t-gold-400 rounded-full animate-spin" />
    </div>
  );
}

function RoleBadge({ role }) {
  const styles = {
    student: "bg-blue-900/20 text-blue-400 border-blue-800/30",
    faculty: "bg-purple-900/20 text-purple-400 border-purple-800/30",
    admin:   "bg-gold-500/10 text-gold-400 border-gold-500/20",
  };
  const icons = {
    student: <GraduationCap size={10} />,
    faculty: <BookOpen size={10} />,
    admin:   <Shield size={10} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border ${styles[role] || styles.student}`}>
      {icons[role]} {role}
    </span>
  );
}

function StatusBadge({ active }) {
  return active
    ? <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border bg-green-900/20 text-green-400 border-green-800/30"><CheckCircle size={10} /> Active</span>
    : <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border bg-red-900/20 text-red-400 border-red-800/30"><UserX size={10} /> Inactive</span>;
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-xl text-sm font-medium z-50 flex items-center gap-2 transition-all ${
      toast.isError
        ? "bg-red-900 border border-red-700 text-red-200"
        : "bg-green-900 border border-green-700 text-green-200"
    }`}>
      {toast.isError ? <AlertTriangle size={15} /> : <CheckCircle size={15} />}
      {toast.msg}
    </div>
  );
}

// ── Create / Edit Modal ────────────────────────────────────────────────────────
function UserModal({ user, onClose, onSave }) {
  const isEdit = !!user?.id;
  const [form, setForm] = useState({
    name:       user?.name       || "",
    email:      user?.email      || "",
    role:       user?.role       || "student",
    department: user?.department || "CS",
    password:   "",
    is_active:  user?.is_active  ?? true,
  });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      const payload = { ...form };
      if (isEdit && !payload.password) delete payload.password;
      await onSave(payload);
      onClose();
    } catch (err) {
      const d = err.response?.data;
      setError(d?.email?.[0] || d?.password?.[0] || d?.detail || "Failed to save user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-navy-800 border border-navy-600 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-600">
          <h2 className="text-white font-semibold">{isEdit ? "Edit User" : "Create New User"}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2.5 text-sm text-red-300">
              <AlertTriangle size={14} className="shrink-0" /> {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1.5">Full Name</label>
            <input required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
              placeholder="e.g. Alex Rivera"
              className="w-full bg-navy-700 border border-navy-500 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1.5">University Email</label>
            <input required type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
              placeholder="user@nust.edu.pk"
              disabled={isEdit}
              className="w-full bg-navy-700 border border-navy-500 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-gold-500 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Role + Department */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1.5">Role</label>
              <div className="relative">
                <select value={form.role} onChange={e => setForm(p => ({...p, role: e.target.value}))}
                  className="w-full bg-navy-700 border border-navy-500 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold-500 transition-colors appearance-none cursor-pointer"
                >
                  {ROLES.map(r => <option key={r} value={r} className="bg-navy-800">{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1.5">Department</label>
              <div className="relative">
                <select value={form.department} onChange={e => setForm(p => ({...p, department: e.target.value}))}
                  className="w-full bg-navy-700 border border-navy-500 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold-500 transition-colors appearance-none cursor-pointer"
                >
                  {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-navy-800">{d}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1.5">
              {isEdit ? "New Password (leave blank to keep)" : "Password"}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(p => ({...p, password: e.target.value}))}
              placeholder={isEdit ? "Leave blank to keep current" : "Min 6 characters"}
              required={!isEdit}
              minLength={isEdit ? 0 : 6}
              className="w-full bg-navy-700 border border-navy-500 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>

          {/* Active toggle (edit only) */}
          {isEdit && (
            <div className="flex items-center justify-between bg-navy-700 border border-navy-500 rounded-lg px-4 py-3">
              <span className="text-white text-sm font-medium">Account Active</span>
              <button type="button"
                onClick={() => setForm(p => ({...p, is_active: !p.is_active}))}
                className={`w-10 h-5 rounded-full transition-colors relative ${form.is_active ? "bg-gold-500" : "bg-navy-500"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm text-slate-400 hover:text-white border border-navy-500 hover:border-navy-400 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 text-sm bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-navy-900 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {saving
                ? <span className="w-4 h-4 border-2 border-navy-900/40 border-t-navy-900 rounded-full animate-spin" />
                : isEdit ? "Save Changes" : "Create User"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Confirm Deactivate Modal ───────────────────────────────────────────────────
function ConfirmModal({ user, onClose, onConfirm, loading }) {
  if (!user) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-navy-800 border border-navy-600 rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <div className="flex items-center justify-center w-14 h-14 bg-red-900/20 border border-red-700/30 rounded-full mx-auto mb-4">
          <UserX size={24} className="text-red-400" />
        </div>
        <h2 className="text-white font-semibold text-center mb-2">
          {user.is_active ? "Deactivate Account" : "Activate Account"}
        </h2>
        <p className="text-slate-400 text-sm text-center mb-6">
          {user.is_active
            ? <>Are you sure you want to deactivate <span className="text-white font-medium">{user.name}</span>? They will lose login access immediately.</>
            : <>Re-activate <span className="text-white font-medium">{user.name}</span>'s account?</>
          }
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm text-slate-400 hover:text-white border border-navy-500 hover:border-navy-400 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
              user.is_active
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            } disabled:opacity-50`}
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : user.is_active ? "Deactivate" : "Activate"
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [roleFilter,  setRoleFilter]  = useState("all");
  const [statusFilter,setStatusFilter]= useState("all");
  const [showCreate,  setShowCreate]  = useState(false);
  const [editUser,    setEditUser]    = useState(null);
  const [confirmUser, setConfirmUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast,       setToast]       = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    authApi.getUsers()
      .then(({ data }) => setUsers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreate = async (data) => {
    await authApi.createUser(data);
    fetchUsers();
    showToast(`User ${data.name} created successfully.`);
  };

  const handleEdit = async (data) => {
    await authApi.updateUser(editUser.id, data);
    fetchUsers();
    showToast("User updated successfully.");
  };

  const handleToggleActive = async () => {
    if (!confirmUser) return;
    setActionLoading(true);
    try {
      if (confirmUser.is_active) {
        await authApi.deactivateUser(confirmUser.id);
        showToast(`${confirmUser.name}'s account has been deactivated.`);
      } else {
        await authApi.updateUser(confirmUser.id, { is_active: true });
        showToast(`${confirmUser.name}'s account has been re-activated.`);
      }
      fetchUsers();
    } catch {
      showToast("Action failed. Please try again.", true);
    } finally {
      setActionLoading(false);
      setConfirmUser(null);
    }
  };

  // Filtered list
  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter   === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || (statusFilter === "active" ? u.is_active : !u.is_active);
    return matchSearch && matchRole && matchStatus;
  });

  const counts = {
    total:    users.length,
    students: users.filter(u => u.role === "student").length,
    faculty:  users.filter(u => u.role === "faculty").length,
    inactive: users.filter(u => !u.is_active).length,
  };

  return (
    <Layout allowedRoles={["admin"]}>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Administration</p>
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <p className="text-slate-400 text-sm mt-1">Create, edit, and manage platform user accounts.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchUsers} className="w-9 h-9 bg-navy-800 border border-navy-600 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <RefreshCw size={15} />
            </button>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <Plus size={15} /> Add User
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Users",    value: counts.total,    color: "text-white"         },
            { label: "Students",       value: counts.students, color: "text-blue-400"      },
            { label: "Faculty",        value: counts.faculty,  color: "text-purple-400"    },
            { label: "Inactive",       value: counts.inactive, color: "text-red-400"       },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-navy-800 border border-navy-600 rounded-xl px-4 py-3 flex items-center gap-3">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-slate-400 text-sm">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, or department..."
              className="w-full bg-navy-800 border border-navy-600 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>
          {/* Role filter */}
          <div className="flex items-center gap-1 bg-navy-800 border border-navy-600 rounded-xl p-1">
            {["all", "student", "faculty", "admin"].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${roleFilter === r ? "bg-gold-500 text-navy-900" : "text-slate-400 hover:text-white"}`}
              >{r === "all" ? "All Roles" : r}</button>
            ))}
          </div>
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-navy-800 border border-navy-600 rounded-xl p-1">
            {["all", "active", "inactive"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${statusFilter === s ? "bg-gold-500 text-navy-900" : "text-slate-400 hover:text-white"}`}
              >{s === "all" ? "All Status" : s}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-navy-800 border border-navy-600 rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-navy-600 text-xs font-medium text-slate-400 uppercase tracking-wider">
            <div className="col-span-4">User</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Department</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {loading ? <Spinner /> : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Users size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No users found.</p>
            </div>
          ) : (
            <div className="divide-y divide-navy-600/50">
              {filtered.map(u => (
                <div key={u.id} className={`grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-navy-700/30 transition-colors ${!u.is_active ? "opacity-60" : ""}`}>
                  {/* User info */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      u.role === "faculty" ? "bg-purple-900/30 text-purple-400 border border-purple-800/30" :
                      u.role === "admin"   ? "bg-gold-500/10 text-gold-400 border border-gold-500/20" :
                      "bg-blue-900/20 text-blue-400 border border-blue-800/30"
                    }`}>
                      {u.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{u.name}</p>
                      <p className="text-slate-500 text-xs truncate">{u.email}</p>
                    </div>
                  </div>

                  <div className="col-span-2"><RoleBadge role={u.role} /></div>
                  <div className="col-span-2">
                    <span className="text-slate-300 text-sm">{u.department || "—"}</span>
                  </div>
                  <div className="col-span-2"><StatusBadge active={u.is_active} /></div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditUser(u)}
                      className="w-8 h-8 bg-navy-700 hover:bg-navy-600 border border-navy-500 hover:border-gold-500/40 rounded-lg flex items-center justify-center text-slate-400 hover:text-gold-400 transition-all"
                      title="Edit user"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => setConfirmUser(u)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${
                        u.is_active
                          ? "bg-navy-700 hover:bg-red-900/20 border-navy-500 hover:border-red-700/40 text-slate-400 hover:text-red-400"
                          : "bg-navy-700 hover:bg-green-900/20 border-navy-500 hover:border-green-700/40 text-slate-400 hover:text-green-400"
                      }`}
                      title={u.is_active ? "Deactivate" : "Activate"}
                    >
                      {u.is_active ? <UserX size={13} /> : <UserCheck size={13} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Row count */}
        {!loading && (
          <p className="text-slate-500 text-xs mt-3 px-1">
            Showing {filtered.length} of {users.length} users
          </p>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <UserModal onClose={() => setShowCreate(false)} onSave={handleCreate} />
      )}
      {editUser && (
        <UserModal user={editUser} onClose={() => setEditUser(null)} onSave={handleEdit} />
      )}
      <ConfirmModal
        user={confirmUser}
        onClose={() => setConfirmUser(null)}
        onConfirm={handleToggleActive}
        loading={actionLoading}
      />

      <Toast toast={toast} />
    </Layout>
  );
}
