import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api.js';
import BookCard from '../components/BookCard.jsx';
import Loader from '../components/Loader.jsx';

export default function Home() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/books?limit=4'), api.get('/categories')])
      .then(([b, c]) => {
        setBooks(b.data.books);
        setCategories(c.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="hero">
        <h1>Welcome to the Indus School Library</h1>
        <p>Search our catalogue and see which books are available, then visit the library desk to borrow.</p>
        <div className="hero-actions">
          <Link to="/student-login" className="btn btn-lg">🎓 Student Login (E-Books)</Link>
          <Link to="/books" className="btn btn-lg hero-secondary">Browse Books</Link>
        </div>
      </section>

      {loading ? (
        <Loader />
      ) : (
        <>
          <section className="section">
            <h2>Browse by Category</h2>
            <div className="chips">
              {categories.map((c) => (
                <Link key={c._id} to={`/books?category=${c._id}`} className="chip chip-lg">
                  {c.name}
                </Link>
              ))}
            </div>
          </section>

          <section className="section">
            <div className="section-head">
              <h2>Newly Added</h2>
              <Link to="/books">View all →</Link>
            </div>
            <div className="grid">
              {books.map((b) => (
                <BookCard key={b._id} book={b} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
