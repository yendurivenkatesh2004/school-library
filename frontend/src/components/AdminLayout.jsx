import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminLayout() {
  const { user } = useAuth();
  const bar = useRef(null);
  const location = useLocation();

  // On phones/tablets the menu is a sideways-scrolling strip: bring the current page's tab into view
  useEffect(() => {
    const strip = bar.current;
    const active = strip?.querySelector('a.active');
    if (strip && active && strip.scrollWidth > strip.clientWidth) {
      strip.scrollLeft = Math.max(active.offsetLeft - 12, 0);
    }
  }, [location.pathname]);

  return (
    <div className="admin-layout">
      <aside className="sidebar" ref={bar}>
        <h3>Librarian Panel</h3>
        <NavLink to="/admin" end>Dashboard</NavLink>
        <NavLink to="/admin/students">Students</NavLink>
        <NavLink to="/admin/books">Books</NavLink>
        <NavLink to="/admin/ebooks">E-Books (links)</NavLink>
        <NavLink to="/admin/categories">Categories</NavLink>
        <NavLink to="/admin/borrows">Issue / Return</NavLink>
        <NavLink to="/admin/reservations">Reservations</NavLink>
        {user.role === 'admin' && <NavLink to="/admin/staff">Accounts & logins</NavLink>}
        <NavLink to="/profile">My profile & password</NavLink>
      </aside>
      <section className="admin-content">
        <Outlet />
      </section>
    </div>
  );
}
