import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { coursesApi } from "../api/courses";
import { BookOpen, Users, Clock, Search, CheckCircle, Plus, Filter } from "lucide-react";

const DEPARTMENTS = ["All", "CS", "HUM", "EE", "SE", "MATH"];

function Spinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-navy-600 border-t-gold-400 rounded-full animate-spin" />
    </div>
  );
}

function CourseCard({ course, onEnroll, enrolling }) {
  const isEnrolled = course.is_enrolled;
  const isFull     = course.enrolled_count >= course.capacity;

  return (
    <div className="bg-navy-800 border border-navy-600 rounded-xl overflow-hidden hover:border-gold-500/30 transition-all group">
      {/* Top color bar */}
      <div className={`h-1.5 w-full ${isEnrolled ? "bg-green-500" : "bg-gold-500/60"}`} />

      <div className="p-5">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-gold-400 bg-gold-500/10 border border-gold-500/20 rounded-md px-2 py-0.5">
            {course.code}
          </span>
          <span className="text-xs text-slate-500 bg-navy-700 border border-navy-500 rounded-md px-2 py-0.5">
            {course.department || "CS"}
          </span>
          {isEnrolled && (
            <span className="text-xs text-green-400 bg-green-900/20 border border-green-800/30 rounded-md px-2 py-0.5 flex items-center gap-1">
              <CheckCircle size={10} /> Enrolled
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-white font-semibold text-sm mb-1 leading-snug group-hover:text-gold-400/90 transition-colors">
          {course.title}
        </h3>
        <p className="text-slate-500 text-xs mb-3">{course.instructor_name}</p>

        {/* Description */}
        {course.description && (
          <p className="text-slate-400 text-xs leading-relaxed mb-4 line-clamp-3">
            {course.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1">
            <Users size={11} />
            {course.enrolled_count}/{course.capacity || "∞"}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {course.credit_hours} cr hrs
          </span>
          {course.schedule && (
            <span className="flex items-center gap-1 truncate">
              {course.schedule}
            </span>
          )}
        </div>

        {/* Enroll button */}
        <button
          onClick={() => !isEnrolled && !isFull && onEnroll(course.id)}
          disabled={isEnrolled || isFull || enrolling === course.id}
          className={`w-full py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            isEnrolled
              ? "bg-green-900/20 border border-green-800/30 text-green-400 cursor-default"
              : isFull
              ? "bg-navy-700 border border-navy-500 text-slate-500 cursor-not-allowed"
              : enrolling === course.id
              ? "bg-gold-500/50 text-navy-900 cursor-not-allowed"
              : "bg-gold-500 hover:bg-gold-600 text-navy-900 cursor-pointer"
          }`}
        >
          {enrolling === course.id ? (
            <span className="w-3.5 h-3.5 border-2 border-navy-900/40 border-t-navy-900 rounded-full animate-spin" />
          ) : isEnrolled ? (
            <><CheckCircle size={12} /> Enrolled</>
          ) : isFull ? (
            "Full"
          ) : (
            <><Plus size={12} /> Enroll Now</>
          )}
        </button>
      </div>
    </div>
  );
}

export default function CourseCatalog() {
  const [courses,    setCourses]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [dept,       setDept]       = useState("All");
  const [enrolling,  setEnrolling]  = useState(null);
  const [toast,      setToast]      = useState("");

  useEffect(() => {
    coursesApi.getCatalog()
      .then(({ data }) => setCourses(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleEnroll = async (courseId) => {
    setEnrolling(courseId);
    try {
      await coursesApi.enroll(courseId);
      setCourses(prev =>
        prev.map(c => c.id === courseId
          ? { ...c, is_enrolled: true, enrolled_count: c.enrolled_count + 1 }
          : c
        )
      );
      const course = courses.find(c => c.id === courseId);
      showToast(`Successfully enrolled in ${course?.title}!`);
    } catch (err) {
      showToast(err.response?.data?.error || "Enrollment failed.", true);
    } finally {
      setEnrolling(null);
    }
  };

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(""), 3500);
  };

  const filtered = courses.filter(c => {
    const matchSearch = !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor_name?.toLowerCase().includes(search.toLowerCase());
    const matchDept = dept === "All" || (c.department || "CS") === dept;
    return matchSearch && matchDept;
  });

  const enrolled   = courses.filter(c => c.is_enrolled).length;
  const available  = courses.filter(c => !c.is_enrolled).length;

  return (
    <Layout allowedRoles={["student"]}>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Discover</p>
          <h1 className="text-2xl font-bold text-white">Course Catalog</h1>
          <p className="text-slate-400 text-sm mt-1">
            Discover curated academic disciplines designed to elevate intellectual clarity.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total Courses",    value: courses.length,  color: "text-white"      },
            { label: "Enrolled",         value: enrolled,         color: "text-green-400"  },
            { label: "Available",        value: available,        color: "text-gold-400"   },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-navy-800 border border-navy-600 rounded-xl px-4 py-3 flex items-center gap-3">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-slate-400 text-sm">{label}</p>
            </div>
          ))}
        </div>

        {/* Search + filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, code, or instructor..."
              className="w-full bg-navy-800 border border-navy-600 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-1 bg-navy-800 border border-navy-600 rounded-xl p-1">
            <Filter size={13} className="text-slate-500 ml-2 mr-1" />
            {DEPARTMENTS.map(d => (
              <button
                key={d}
                onClick={() => setDept(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  dept === d
                    ? "bg-gold-500 text-navy-900"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-500">
            <BookOpen size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No courses found.</p>
            <p className="text-xs mt-1">Try a different search or department filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map(c => (
              <CourseCard
                key={c.id}
                course={c}
                onEnroll={handleEnroll}
                enrolling={enrolling}
              />
            ))}
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-xl text-sm font-medium transition-all z-50 flex items-center gap-2 ${
          toast.isError
            ? "bg-red-900 border border-red-700 text-red-200"
            : "bg-green-900 border border-green-700 text-green-200"
        }`}>
          {toast.isError ? "✕" : <CheckCircle size={15} />}
          {toast.msg}
        </div>
      )}
    </Layout>
  );
}
