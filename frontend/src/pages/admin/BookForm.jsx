import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getError } from '../../api/api.js';
import Loader from '../../components/Loader.jsx';
import { COVER_TYPES, MAX_COVER_MB, imageUrl } from '../../utils/images.js';

const empty = {
  title: '',
  bookId: '',
  author: '',
  category: '',
  shelfLocation: '',
  totalCopies: 1,
};

export default function BookForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const fileInput = useRef(null);
  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  // Cover image state
  const [currentCover, setCurrentCover] = useState(''); // already saved on the server
  const [file, setFile] = useState(null); // newly chosen file
  const [preview, setPreview] = useState('');
  const [removeCover, setRemoveCover] = useState(false);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data));
    if (editing) {
      api
        .get(`/books/${id}`)
        .then((res) => {
          setForm({
            title: res.data.title,
            bookId: res.data.bookId,
            author: res.data.author,
            category: res.data.category?._id || '',
            shelfLocation: res.data.shelfLocation,
            totalCopies: res.data.totalCopies,
          });
          setCurrentCover(res.data.coverImage || '');
        })
        .catch(() => {
          toast.error('Book not found');
          navigate('/admin/books');
        })
        .finally(() => setLoading(false));
    }
  }, [id, editing, navigate]);

  // Free the temporary preview URL
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!COVER_TYPES.includes(f.type)) {
      toast.error('Please choose a JPG, PNG or WEBP image');
      e.target.value = '';
      return;
    }
    if (f.size > MAX_COVER_MB * 1024 * 1024) {
      toast.error(`Image is too large. Maximum size is ${MAX_COVER_MB} MB`);
      e.target.value = '';
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setRemoveCover(false);
  };

  const clearChosenFile = () => {
    setFile(null);
    setPreview('');
    if (fileInput.current) fileInput.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // multipart form so the image file can be sent with the text fields
    const data = new FormData();
    Object.entries({ ...form, totalCopies: Number(form.totalCopies) }).forEach(([k, v]) => data.append(k, v));
    if (file) data.append('cover', file);
    if (editing && removeCover && !file) data.append('removeCover', 'true');

    try {
      if (editing) await api.put(`/books/${id}`, data);
      else await api.post('/books', data);
      toast.success(editing ? 'Book updated' : 'Book added');
      navigate('/admin/books');
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  const shownCover = preview || (!removeCover && currentCover ? imageUrl(currentCover) : '');

  return (
    <div>
      <h1>{editing ? 'Edit Book' : 'Add New Book'}</h1>
      <form className="card form-grid" onSubmit={handleSubmit}>
        <div>
          <label>Book name *</label>
          <input required value={form.title} onChange={set('title')} />
        </div>
        <div>
          <label>Book ID *</label>
          <input required placeholder="e.g. BK-101" value={form.bookId} onChange={set('bookId')} />
        </div>
        <div>
          <label>Author *</label>
          <input required value={form.author} onChange={set('author')} />
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
        <div>
          <label>Shelf *</label>
          <input required placeholder="e.g. A-12" value={form.shelfLocation} onChange={set('shelfLocation')} />
        </div>
        <div>
          <label>Number of copies *</label>
          <input type="number" min="1" required value={form.totalCopies} onChange={set('totalCopies')} />
        </div>

        <div className="full">
          <label>Book image (cover)</label>
          <div className="cover-picker">
            <div className="cover-preview">
              {shownCover ? (
                <img src={shownCover} alt="Book cover preview" />
              ) : (
                <span className="muted">No image</span>
              )}
            </div>
            <div className="cover-controls">
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={pickFile}
              />
              <small className="muted">JPG, PNG or WEBP, up to {MAX_COVER_MB} MB. Optional.</small>
              {file && (
                <button type="button" className="btn btn-outline btn-sm" onClick={clearChosenFile}>
                  Clear chosen image
                </button>
              )}
              {editing && currentCover && !file && (
                <label className="check">
                  <input type="checkbox" checked={removeCover} onChange={(e) => setRemoveCover(e.target.checked)} />
                  Remove the current image
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="full">
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save book'}</button>{' '}
          <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/books')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
