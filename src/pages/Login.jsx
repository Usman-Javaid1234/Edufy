import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, AlertCircle, GraduationCap } from "lucide-react";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showOtp, setShowOtp]   = useState(false);
  const [locked, setLocked]     = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); // simulate network
    const result = login(email, password);
    setLoading(false);

    if (result.success) {
      const role = result.user.role;
      if (role === "student")  navigate("/dashboard");
      else if (role === "faculty") navigate("/faculty");
      else if (role === "admin")   navigate("/admin/users");
    } else {
      setError(result.error);
      if (result.locked) setLocked(true);
    }
  };

  if (showOtp) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <GraduationCap className="mx-auto text-gold-400 mb-3" size={40} />
            <h1 className="text-2xl font-bold text-gold-400 tracking-wide">Edufy</h1>
            <p className="text-slate-400 text-xs tracking-widest uppercase mt-1">The Scholarly Curator</p>
          </div>
          <div className="bg-navy-800 border border-navy-600 rounded-2xl p-8">
            <h2 className="text-lg font-semibold text-white mb-2">Reset Password</h2>
            <p className="text-slate-400 text-sm mb-6">An OTP has been sent to <span className="text-gold-400">{email}</span></p>
            <input
              type="text" placeholder="Enter OTP"
              className="w-full bg-navy-700 border border-navy-500 rounded-lg px-4 py-3 text-white placeholder-slate-500 text-sm mb-4 focus:outline-none focus:border-gold-500"
            />
            <button className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold py-3 rounded-lg text-sm transition-colors">
              Verify OTP
            </button>
            <button onClick={() => setShowOtp(false)} className="w-full mt-3 text-slate-400 hover:text-white text-sm transition-colors">
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-500 opacity-5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-navy-700 border border-navy-500 rounded-2xl mb-4">
            <GraduationCap className="text-gold-400" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-gold-400 tracking-wide">Edufy</h1>
          <p className="text-slate-500 text-xs tracking-widest uppercase mt-1">The Scholarly Curator</p>
        </div>

        {/* Card */}
        <div className="bg-navy-800 border border-navy-600 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-1">Sign In</h2>
          <p className="text-slate-400 text-sm mb-6">Use your university credentials</p>

          {/* Error Banner */}
          {error && (
            <div className={`flex items-start gap-3 rounded-lg px-4 py-3 mb-5 text-sm ${
              locked
                ? "bg-red-900/40 border border-red-700/50 text-red-300"
                : "bg-yellow-900/30 border border-yellow-700/40 text-yellow-300"
            }`}>
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                University Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="student@nust.edu.pk"
                  required
                  disabled={locked}
                  className="w-full bg-navy-700 border border-navy-500 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowOtp(true)}
                  className="text-xs text-gold-400 hover:text-gold-300 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={locked}
                  className="w-full bg-navy-700 border border-navy-500 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || locked}
              className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-60 disabled:cursor-not-allowed text-navy-900 font-semibold py-3 rounded-lg text-sm transition-colors mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-navy-900/40 border-t-navy-900 rounded-full animate-spin" />
              ) : "Sign In"}
            </button>
          </form>

          {/* Faculty sign in hint */}
          <div className="mt-4 pt-4 border-t border-navy-600">
            <button className="w-full border border-navy-500 hover:border-gold-500/50 text-slate-300 hover:text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
              <GraduationCap size={15} />
              Faculty Sign In
            </button>
          </div>

          <p className="text-center text-slate-500 text-xs mt-5">
            New to the institution?{" "}
            <span className="text-gold-400 cursor-pointer hover:text-gold-300">Request Access</span>
          </p>
        </div>

        {/* Hint */}
        <div className="mt-4 bg-navy-800/50 border border-navy-600/50 rounded-xl p-4">
          <p className="text-slate-500 text-xs text-center font-medium mb-2">Quick Access</p>
          <div className="grid grid-cols-3 gap-2 text-xs text-center">
            {[
              ["Student", "student@nust.edu.pk"],
              ["Faculty", "faculty@nust.edu.pk"],
              ["Admin", "admin@nust.edu.pk"],
            ].map(([role, em]) => (
              <button
                key={role}
                onClick={() => { setEmail(em); setPassword("Test@1234"); }}
                className="bg-navy-700 hover:bg-navy-600 text-slate-300 rounded-lg py-2 px-1 transition-colors"
              >
                {role}
              </button>
            ))}
          </div>
          <p className="text-slate-600 text-xs text-center mt-2">Password: Test@1234</p>
        </div>
      </div>
    </div>
  );
}
