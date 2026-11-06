import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getError } from '../../api/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Loader from '../../components/Loader.jsx';
import Modal from '../../components/Modal.jsx';

const blank = { name: '', email: '', password: '', role: 'librarian' };

// Login accounts: librarians, admins and the one shared student login (e-books only).
// Student records (enrollment) are managed on the Students page.
export default function ManageUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blank);

  const load = () =>
    api
      .get('/users')
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', form);
      toast.success('Staff account created');
      setForm(blank);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  // Admin sets a new password for any account (admin, librarian or the shared student login)
  const [resetting, setResetting] = useState(null);
  const [pw, setPw] = useState({ next: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);

  const openReset = (u) => {
    setResetting(u);
    setPw({ next: '', confirm: '' });
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) return toast.error('The two passwords do not match');
    setSavingPw(true);
    try {
      await api.put(`/users/${resetting._id}`, { password: pw.next });
      toast.success(`Password changed for ${resetting.email}`);
      setResetting(null);
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setSavingPw(false);
    }
  };

  const update = async (u, changes) => {
    try {
      await api.put(`/users/${u._id}`, changes);
      toast.success('Account updated');
      load();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name}?`)) return;
    try {
      await api.delete(`/users/${u._id}`);
      toast.success('Account deleted');
      load();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <div className="section-head">
        <h1>Accounts &amp; Logins</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close' : '+ Add Account'}
        </button>
      </div>

      {showForm && (
        <form className="card form-grid" onSubmit={handleCreate}>
          <div>
            <label>Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label>Email *</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label>Password *</label>
            <input type="password" minLength={6} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label>Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="librarian">Librarian</option>
              <option value="admin">Admin</option>
              <option value="student">Student (shared login, e-books only)</option>
            </select>
          </div>
          <div className="full"><button className="btn btn-primary">Create account</button></div>
        </form>
      )}

      {loading ? (
        <Loader />
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Active</th><th /></tr></thead>
            <tbody>
              {users.map((u) => {
                const isMe = u._id === me._id;
                return (
                  <tr key={u._id}>
                    <td>{u.name}{isMe && <small className="muted"> (you)</small>}</td>
                    <td>{u.email}</td>
                    <td>
                      <select value={u.role} disabled={isMe} onChange={(e) => update(u, { role: e.target.value })}>
                        <option value="librarian">librarian</option>
                        <option value="admin">admin</option>
                        <option value="student">student</option>
                      </select>
                    </td>
                    <td>
                      <input type="checkbox" checked={u.isActive} disabled={isMe} onChange={(e) => update(u, { isActive: e.target.checked })} />
                    </td>
                    <td className="actions">
                      <button className="btn btn-outline btn-sm" onClick={() => openReset(u)}>{isMe ? 'Change my password' : 'Reset password'}</button>
                      <button className="btn btn-danger btn-sm" disabled={isMe} onClick={() => remove(u)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {resetting && (
        <Modal title={`Change password: ${resetting.name}`} onClose={() => setResetting(null)}>
          <form onSubmit={handleReset}>
            <p className="muted">
              {resetting.email} ({resetting.role}). They will use the new password the next time they log in.
            </p>
            <label>New password (at least 6 characters)</label>
            <input
              type="password"
              required
              minLength={6}
              autoFocus
              autoComplete="new-password"
              value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.target.value })}
            />
            <label>Confirm new password</label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={pw.confirm}
              onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
            />
            <div style={{ marginTop: '1rem' }}>
              <button className="btn btn-primary" disabled={savingPw}>{savingPw ? 'Saving...' : 'Change password'}</button>{' '}
              <button type="button" className="btn btn-outline" onClick={() => setResetting(null)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
