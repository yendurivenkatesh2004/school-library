import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getError } from '../../api/api.js';
import Loader from '../../components/Loader.jsx';
import Pagination from '../../components/Pagination.jsx';
import { BookCover } from '../../components/BookCard.jsx';

export default function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [searchText, setSearchText] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get('/books', { params: { search: query, page, limit: 10, sort: 'title' } })
      .then((res) => {
        setBooks(res.data.books);
        setMeta({ page: res.data.page, pages: res.data.pages, total: res.data.total });
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [query, page]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setQuery(searchText);
    }, 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const handleDelete = async (book) => {
    if (!window.confirm(`Delete "${book.title}" (${book.bookId})?`)) return;
    try {
      await api.delete(`/books/${book._id}`);
      toast.success('Book deleted');
      load();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <div className="section-head">
        <h1>Books</h1>
        <Link to="/admin/books/new" className="btn btn-primary">+ Add Book</Link>
      </div>

      <div className="filters">
        <input
          className="search"
          placeholder="Search by book name, author or book ID..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <p className="muted">{meta.total} book(s)</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Image</th><th>Book ID</th><th>Book name</th><th>Author</th><th>Category</th><th>Shelf</th><th>Available / Total</th><th /></tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b._id}>
                    <td><BookCover book={b} className="thumb" /></td>
                    <td>{b.bookId}</td>
                    <td>{b.title}</td>
                    <td>{b.author}</td>
                    <td>{b.category?.name || '-'}</td>
                    <td>{b.shelfLocation}</td>
                    <td>{b.availableCopies} / {b.totalCopies}</td>
                    <td className="actions">
                      <Link to={`/admin/books/${b._id}/edit`} className="btn btn-outline btn-sm">Edit</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {books.length === 0 && (
                  <tr><td colSpan="8" className="center muted">No books found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
