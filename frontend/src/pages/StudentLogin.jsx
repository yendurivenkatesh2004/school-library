import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { getError } from '../api/api.js';

export default function StudentLogin() {
  const { user, studentLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  if (user?.role === 'student') return <Navigate to="/ebooks" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await studentLogin(form.email.trim(), form.password);
      toast.success('Welcome! You can now read and download e-books.');
      navigate('/ebooks', { replace: true });
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Student Login</h2>
      <p className="muted center">Log in to read and download e-books.</p>
      <form onSubmit={handleSubmit}>
        <label>Login ID (email)</label>
        <input
          type="email"
          required
          autoFocus
          placeholder="student@school.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <label>Password</label>
        <input
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Login'}
        </button>
      </form>
      <p className="muted center">
        Don't know the login ID or password? Ask the librarian.
        <br />
        Library staff? <Link to="/login">Librarian login</Link>
      </p>
    </div>
  );
}
