import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout, isStaff } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false); // mobile / tablet menu

  // Close the menu when the page changes or Escape is pressed
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <img src="/logo-indus.png" alt="First Among Equals" className="logo-left" />
          <span>📚 School Library</span>
        </Link>

        <div id="nav-menu" className={`nav-menu ${open ? 'open' : ''}`}>
          <nav className="nav-links" aria-label="Main">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/books">Books</NavLink>
            {user && <NavLink to="/ebooks">E-Books</NavLink>}
            {isStaff && <NavLink to="/admin">Librarian Panel</NavLink>}
          </nav>
          <div className="nav-actions">
            {user ? (
              <>
                {isStaff ? (
                  <Link to="/profile" className="nav-user">
                    {user.name} <span className="role-tag">{user.role}</span>
                  </Link>
                ) : (
                  <span className="nav-user">
                    {user.name} <span className="role-tag">student</span>
                  </span>
                )}
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/student-login" className="btn btn-primary btn-sm">Student Login</Link>
                <Link to="/login" className="btn btn-outline btn-sm">Librarian Login</Link>
              </>
            )}
          </div>
        </div>

        <img
          src="/logo-50years.png"
          alt="Golden Jubilee: 50 years of excellence since 1976"
          className="logo-right"
        />

        <button
          type="button"
          className="nav-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="nav-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
}
