import { createContext, useContext, useState } from "react";
import { users } from "../data/mockData";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);

  const login = (email, password) => {
    // Check lock
    if (lockedUntil && new Date() < lockedUntil) {
      const mins = Math.ceil((lockedUntil - new Date()) / 60000);
      return { success: false, error: `Account locked. Please try again in ${mins} minute(s).`, locked: true };
    }

    const user = users.find(u => u.email === email && u.password === password && u.active);
    if (user) {
      setFailedAttempts(0);
      setLockedUntil(null);
      setCurrentUser(user);
      return { success: true, user };
    }

    // Check for deactivated account
    const deactivated = users.find(u => u.email === email && !u.active);
    if (deactivated) {
      return { success: false, error: "Your account has been deactivated. Contact admin." };
    }

    const newCount = failedAttempts + 1;
    setFailedAttempts(newCount);
    if (newCount >= 3) {
      const lockTime = new Date(Date.now() + 15 * 60 * 1000);
      setLockedUntil(lockTime);
      setFailedAttempts(0);
      return { success: false, error: "Account locked. Please try again in 15 minutes.", locked: true };
    }
    return { success: false, error: `Invalid credentials. ${3 - newCount} attempt(s) remaining.` };
  };

  const logout = () => setCurrentUser(null);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, failedAttempts }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
