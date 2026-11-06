import { useState } from 'react';
import toast from 'react-hot-toast';
import api, { getError } from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user.name || '', phone: user.phone || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/auth/profile', form);
      setUser(data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getError(err));
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) return toast.error('New password and confirm password do not match');
    try {
      await api.put('/auth/password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password changed');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <div className="two-col">
      <form className="card" onSubmit={saveProfile}>
        <h3>My Profile</h3>
        <label>Email</label>
        <input value={user.email} disabled />
        <label>Role</label>
        <input value={user.role} disabled />
        <label>Name</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <label>Phone</label>
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <button className="btn btn-primary" style={{ marginTop: '1rem' }}>Save changes</button>
      </form>

      <form className="card" onSubmit={savePassword}>
        <h3>Change My Password</h3>
        <label>Current password</label>
        <input type="password" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
        <label>New password</label>
        <input type="password" minLength={6} required autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
        <label>Confirm new password</label>
        <input type="password" minLength={6} required autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
        <button className="btn btn-primary" style={{ marginTop: '1rem' }}>Update password</button>
      </form>
    </div>
  );
}
