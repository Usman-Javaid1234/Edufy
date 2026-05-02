import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  GraduationCap, LayoutDashboard, BookOpen, ClipboardList,
  Star, Users, LogOut, Shield
} from "lucide-react";

const studentLinks = [
  { to: "/dashboard",   icon: LayoutDashboard, label: "Dashboard"     },
  { to: "/courses",     icon: BookOpen,         label: "Course Catalog" },
  { to: "/assignments", icon: ClipboardList,    label: "Assignments"   },
  { to: "/grades",      icon: Star,             label: "Grades"        },
];

const facultyLinks = [
  { to: "/faculty",         icon: LayoutDashboard, label: "Dashboard"  },
  { to: "/faculty/courses", icon: BookOpen,         label: "My Courses" },
  { to: "/faculty/grading", icon: ClipboardList,    label: "Grading"    },
];

const adminLinks = [
  { to: "/admin/users", icon: Users,  label: "User Management" },
];

export default function Sidebar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const links =
    currentUser?.role === "faculty" ? facultyLinks :
    currentUser?.role === "admin"   ? adminLinks   : studentLinks;

  const handleLogout = () => { logout(); navigate("/login"); };

  const roleColor = {
    student: "bg-blue-900/20 text-blue-400 border-blue-800/30",
    faculty: "bg-purple-900/20 text-purple-400 border-purple-800/30",
    admin:   "bg-gold-500/10 text-gold-400 border-gold-500/20",
  };

  return (
    <aside className="w-56 min-h-screen bg-navy-800 border-r border-navy-600 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-navy-600">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gold-500/20 rounded-lg flex items-center justify-center">
            <GraduationCap size={18} className="text-gold-400" />
          </div>
          <div>
            <p className="text-gold-400 font-bold text-sm tracking-wide leading-none">Edufy</p>
            <p className="text-slate-500 text-xs leading-none mt-0.5">Scholarly Curator</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                isActive
                  ? "bg-gold-500/15 text-gold-400 border-gold-500/20"
                  : "text-slate-400 hover:text-white hover:bg-navy-700 border-transparent"
              }`
            }
          >
            <Icon size={16} />
            <span className="flex-1">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-navy-600">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 ${roleColor[currentUser?.role] || roleColor.student}`}>
            {currentUser?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{currentUser?.name}</p>
            <p className="text-slate-500 text-xs capitalize">{currentUser?.role}</p>
          </div>
          {currentUser?.role === "admin" && <Shield size={13} className="text-gold-400 shrink-0" />}
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-900/10 transition-all"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
