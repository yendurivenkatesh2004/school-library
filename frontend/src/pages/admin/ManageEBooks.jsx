import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getError } from '../../api/api.js';
import Loader from '../../components/Loader.jsx';
import Modal from '../../components/Modal.jsx';
import Pagination from '../../components/Pagination.jsx';
import { formatDate } from '../../utils/dateUtils.js';
import { isSafeUrl } from '../../utils/links.js';

const blank = { title: '', author: '', category: '', link: '', description: '', allowDownload: true };

// Librarian / admin: add, edit and delete e-book links that students can see
export default function ManageEBooks() {
  const [ebooks, setEbooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [searchText, setSearchText] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get('/ebooks', { params: { search: query, page, limit: 10 } })
      .then((res) => {
        setEbooks(res.data.ebooks);
        setMeta({ page: res.data.page, pages: res.data.pages, total: res.data.total });
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [query, page]);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setQuery(searchText);
    }, 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const openAdd = () => {
    setEditingId(null);
    setForm(blank);
    setFormOpen(true);
  };

  const openEdit = (e) => {
    setEditingId(e._id);
    setForm({
      title: e.title,
      author: e.author || '',
      category: e.category?._id || '',
      link: e.link,
      description: e.description || '',
      allowDownload: e.allowDownload,
    });
    setFormOpen(true);
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isSafeUrl(form.link.trim())) return toast.error('The link must start with http:// or https://');

    setSaving(true);
    const payload = { ...form, link: form.link.trim() };
    try {
      if (editingId) await api.put(`/ebooks/${editingId}`, payload);
      else await api.post('/ebooks', payload);
      toast.success(editingId ? 'E-book updated' : 'E-book added. Students can see it now.');
      setFormOpen(false);
      load();
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e) => {
    if (!window.confirm(`Delete e-book "${e.title}"?`)) return;
    try {
      await api.delete(`/ebooks/${e._id}`);
      toast.success('E-book deleted');
      load();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <div className="section-head">
        <h1>E-Books (links)</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add E-Book Link</button>
      </div>
      <p className="muted">Links added here appear on the students' E-Books page.</p>

      <div className="filters" style={{ marginTop: '1rem' }}>
        <input
          className="search"
          placeholder="Search by title, author or description..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <p className="muted">{meta.total} e-book(s)</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Title</th><th>Author</th><th>Category</th><th>Link</th><th>Download</th><th>Added</th><th /></tr>
              </thead>
              <tbody>
                {ebooks.map((e) => (
                  <tr key={e._id}>
                    <td>{e.title}</td>
                    <td>{e.author || '-'}</td>
                    <td>{e.category?.name || '-'}</td>
                    <td>
                      {isSafeUrl(e.link) ? (
                        <a href={e.link} target="_blank" rel="noopener noreferrer">Open link</a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <span className={`badge ${e.allowDownload ? 'badge-green' : 'badge-gray'}`}>
                        {e.allowDownload ? 'Allowed' : 'Read only'}
                      </span>
                    </td>
                    <td>{formatDate(e.createdAt)}</td>
                    <td className="actions">
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(e)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {ebooks.length === 0 && (
                  <tr><td colSpan="7" className="center muted">No e-books added yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />
        </>
      )}

      {formOpen && (
        <Modal title={editingId ? 'Edit E-Book Link' : 'Add E-Book Link'} onClose={() => setFormOpen(false)}>
          <form className="form-grid" onSubmit={handleSave}>
            <div className="full">
              <label>Title *</label>
              <input required value={form.title} onChange={set('title')} />
            </div>
            <div>
              <label>Author</label>
              <input value={form.author} onChange={set('author')} />
            </div>
            <div>
              <label>Category</label>
              <select value={form.category} onChange={set('category')}>
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="full">
              <label>E-book link * (PDF, Google Drive or website URL)</label>
              <input required placeholder="https://..." value={form.link} onChange={set('link')} />
            </div>
            <div className="full">
              <label>Description</label>
              <textarea rows="3" maxLength={500} value={form.description} onChange={set('description')} />
            </div>
            <div className="full">
              <label className="check">
                <input
                  type="checkbox"
                  checked={form.allowDownload}
                  onChange={(e) => setForm({ ...form, allowDownload: e.target.checked })}
                />
                Allow students to download this e-book
              </label>
            </div>
            <div className="full">
              <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save e-book'}</button>{' '}
              <button type="button" className="btn btn-outline" onClick={() => setFormOpen(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
