import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session on page load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const saveSession = (data) => {
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  // Librarian / admin
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return saveSession(data);
  };

  // Student
  const studentLogin = async (email, password) => {
    const { data } = await api.post('/auth/student-login', { email, password });
    return saveSession(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isStudent = user?.role === 'student';
  const isStaff = user ? ['admin', 'librarian'].includes(user.role) : false;

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, studentLogin, logout, isStaff, isStudent }}>
      {children}
    </AuthContext.Provider>
  );
}
