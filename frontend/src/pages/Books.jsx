import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/api.js';
import BookCard from '../components/BookCard.jsx';
import Loader from '../components/Loader.jsx';
import Pagination from '../components/Pagination.jsx';

export default function Books() {
  const [params, setParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState(params.get('search') || '');

  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const available = params.get('available') || '';
  const page = Number(params.get('page') || 1);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  // Debounce the search box
  useEffect(() => {
    const t = setTimeout(() => updateParam('search', searchText), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  useEffect(() => {
    setLoading(true);
    api
      .get('/books', { params: { search, category, available, page, limit: 12 } })
      .then((res) => {
        setBooks(res.data.books);
        setMeta({ page: res.data.page, pages: res.data.pages, total: res.data.total });
      })
      .finally(() => setLoading(false));
  }, [search, category, available, page]);

  function updateParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    if (next.toString() !== params.toString()) setParams(next);
  }

  return (
    <div>
      <h1>Books</h1>
      <div className="filters">
        <input
          className="search"
          placeholder="Search by book name, author or book ID..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select value={category} onChange={(e) => updateParam('category', e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <label className="check">
          <input
            type="checkbox"
            checked={available === 'true'}
            onChange={(e) => updateParam('available', e.target.checked ? 'true' : '')}
          />
          Available only
        </label>
      </div>

      {loading ? (
        <Loader />
      ) : books.length === 0 ? (
        <p className="empty">No books found.</p>
      ) : (
        <>
          <p className="muted">{meta.total} book(s) found</p>
          <div className="grid">
            {books.map((b) => (
              <BookCard key={b._id} book={b} />
            ))}
          </div>
          <Pagination page={meta.page} pages={meta.pages} onChange={(p) => updateParam('page', String(p))} />
        </>
      )}
    </div>
  );
}
