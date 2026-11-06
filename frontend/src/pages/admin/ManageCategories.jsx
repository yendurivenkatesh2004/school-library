import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getError } from '../../api/api.js';
import Loader from '../../components/Loader.jsx';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);

  const load = () =>
    api
      .get('/categories')
      .then((res) => setCategories(res.data))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', form);
      toast.success('Category added');
      setForm({ name: '', description: '' });
      load();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    try {
      await api.delete(`/categories/${c._id}`);
      toast.success('Category deleted');
      load();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <h1>Categories</h1>
      <form className="card inline-form" onSubmit={handleAdd}>
        <input required placeholder="Category name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="btn btn-primary">Add</button>
      </form>

      {loading ? (
        <Loader />
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Description</th><th /></tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.description || '-'}</td>
                  <td className="actions">
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c)}>Delete</button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan="3" className="center muted">No categories yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
