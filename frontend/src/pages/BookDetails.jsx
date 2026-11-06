import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/api.js';
import { BookCover } from '../components/BookCard.jsx';
import Loader from '../components/Loader.jsx';

export default function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/books/${id}`)
      .then((res) => setBook(res.data))
      .catch(() => setBook(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!book) return <p className="empty">Book not found. <Link to="/books">Back to books</Link></p>;

  const available = book.availableCopies > 0;

  return (
    <div className="details">
      <BookCover book={book} className="cover-lg" />
      <div className="details-info">
        <Link to="/books" className="muted">← Back to books</Link>
        <h1>{book.title}</h1>
        <p className="author">by {book.author}</p>

        <div className="meta">
          {book.category?.name && <span className="chip">{book.category.name}</span>}
          <span className={`badge ${available ? 'badge-green' : 'badge-red'}`}>
            {available ? `${book.availableCopies} of ${book.totalCopies} copies available` : 'All copies issued'}
          </span>
        </div>

        <table className="info-table">
          <tbody>
            <tr><th>Book ID</th><td>{book.bookId}</td></tr>
            <tr><th>Shelf</th><td>{book.shelfLocation}</td></tr>
            <tr><th>Total copies</th><td>{book.totalCopies}</td></tr>
            <tr><th>Available</th><td>{book.availableCopies}</td></tr>
          </tbody>
        </table>

        <p className="muted">To borrow this book, please visit the library desk and tell the librarian your student ID.</p>
      </div>
    </div>
  );
}
