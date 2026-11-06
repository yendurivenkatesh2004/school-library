import { useState } from 'react';
import { Link } from 'react-router-dom';
import { imageUrl } from '../utils/images.js';

// Shows the uploaded cover; falls back to a coloured letter if there is no image (or it fails to load)
export function BookCover({ book, className = '' }) {
  const [failed, setFailed] = useState(false);

  if (book.coverImage && !failed) {
    return (
      <img
        src={imageUrl(book.coverImage)}
        alt={`Cover of ${book.title}`}
        className={`cover ${className}`}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className={`cover cover-fallback ${className}`}>
      <span>{book.title?.charAt(0)}</span>
    </div>
  );
}

export default function BookCard({ book }) {
  const available = book.availableCopies > 0;
  return (
    <Link to={`/books/${book._id}`} className="book-card">
      <BookCover book={book} />
      <div className="book-card-body">
        <h4>{book.title}</h4>
        <p className="muted">{book.author}</p>
        <small className="muted">ID: {book.bookId} · Shelf {book.shelfLocation}</small>
        <div className="book-card-foot">
          {book.category?.name && <span className="chip">{book.category.name}</span>}
          <span className={`badge ${available ? 'badge-green' : 'badge-red'}`}>
            {available ? `${book.availableCopies} available` : 'Out of stock'}
          </span>
        </div>
      </div>
    </Link>
  );
}
