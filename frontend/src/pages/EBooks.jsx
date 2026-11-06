import { useEffect, useState } from 'react';
import api from '../api/api.js';
import Loader from '../components/Loader.jsx';
import Pagination from '../components/Pagination.jsx';
import { downloadUrl, isSafeUrl } from '../utils/links.js';

// Visible to logged-in students (and staff). Read-only: open a link or download it.
export default function EBooks() {
  const [ebooks, setEbooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearch(searchText);
    }, 400);
    return () => clearTimeout(t);
  }, [searchText]);

  useEffect(() => {
    setLoading(true);
    api
      .get('/ebooks', { params: { search, category, page, limit: 12 } })
      .then((res) => {
        setEbooks(res.data.ebooks);
        setMeta({ page: res.data.page, pages: res.data.pages, total: res.data.total });
      })
      .finally(() => setLoading(false));
  }, [search, category, page]);

  return (
    <div>
      <h1>E-Books</h1>
      <p className="muted">Read online or download electronic books shared by your library.</p>

      <div className="filters" style={{ marginTop: '1rem' }}>
        <input
          className="search"
          placeholder="Search by title, author or topic..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : ebooks.length === 0 ? (
        <p className="empty">No e-books found.</p>
      ) : (
        <>
          <p className="muted">{meta.total} e-book(s)</p>
          <div className="ebook-list">
            {ebooks.map((e) => (
              <div key={e._id} className="ebook-card">
                <div className="ebook-icon">📖</div>
                <div className="ebook-body">
                  <h4>{e.title}</h4>
                  {e.author && <p className="muted">by {e.author}</p>}
                  {e.category?.name && <span className="chip">{e.category.name}</span>}
                  {e.description && <p className="ebook-desc">{e.description}</p>}
                </div>
                <div className="ebook-actions">
                  {isSafeUrl(e.link) ? (
                    <>
                      <a className="btn btn-primary btn-sm" href={e.link} target="_blank" rel="noopener noreferrer">
                        Read online
                      </a>
                      {e.allowDownload ? (
                        <a
                          className="btn btn-outline btn-sm"
                          href={downloadUrl(e.link)}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                        >
                          Download
                        </a>
                      ) : (
                        <small className="muted">Download not allowed</small>
                      )}
                    </>
                  ) : (
                    <small className="muted">Link unavailable</small>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
