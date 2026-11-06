import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api.js';
import Loader from '../../components/Loader.jsx';
import { daysLate, formatDate, formatDateTime } from '../../utils/dateUtils.js';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then((res) => setStats(res.data));
  }, []);

  if (!stats) return <Loader />;

  const cards = [
    { label: 'Students enrolled', value: stats.totalStudents, to: '/admin/students' },
    { label: 'Total books (titles)', value: stats.totalTitles, to: '/admin/books' },
    { label: 'Total copies', value: stats.totalCopies },
    { label: 'Copies available', value: stats.availableCopies },
    { label: 'Currently borrowed', value: stats.currentlyBorrowed, to: '/admin/borrows' },
    { label: 'Overdue', value: stats.overdue, danger: stats.overdue > 0, to: '/admin/borrows?status=overdue' },
    { label: 'Active reservations', value: stats.activeReservations, to: '/admin/reservations' },
  ];

  return (
    <div>
      <h1>Dashboard</h1>

      <div className="stat-grid">
        {cards.map((c) => {
          const body = (
            <>
              <span className="stat-value">{c.value}</span>
              <span className="stat-label">{c.label}</span>
            </>
          );
          return c.to ? (
            <Link key={c.label} to={c.to} className={`stat stat-link ${c.danger ? 'stat-danger' : ''}`}>
              {body}
            </Link>
          ) : (
            <div key={c.label} className="stat">{body}</div>
          );
        })}
      </div>

      {stats.overdueList.length > 0 && (
        <div className="card">
          <div className="section-head">
            <h3>Not returned after the due date</h3>
            <Link to="/admin/borrows?status=overdue">View all {stats.overdue} →</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Student</th><th>Class</th><th>Parent phone</th><th>Book</th><th>Due date</th><th>Days late</th><th>Fine</th></tr>
              </thead>
              <tbody>
                {stats.overdueList.map((b) => (
                  <tr key={b._id}>
                    <td>{b.student?.name}<br /><small className="muted">{b.student?.studentId}</small></td>
                    <td>{b.student?.className}-{b.student?.section}</td>
                    <td>{b.student?.parentPhone}</td>
                    <td>{b.book?.title}<br /><small className="muted">{b.book?.bookId}</small></td>
                    <td>{formatDate(b.dueDate)}</td>
                    <td><span className="badge badge-red">{daysLate(b.dueDate)} days</span></td>
                    <td>₹{b.currentFine}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <h3>Books and copies</h3>
        <div className="table-wrap scroll">
          <table>
            <thead>
              <tr><th>Book ID</th><th>Book name</th><th>Author</th><th>Shelf</th><th>Total copies</th><th>Available</th><th>Borrowed</th></tr>
            </thead>
            <tbody>
              {stats.inventory.map((b) => (
                <tr key={b._id}>
                  <td>{b.bookId}</td>
                  <td>{b.title}</td>
                  <td>{b.author}</td>
                  <td>{b.shelfLocation}</td>
                  <td>{b.totalCopies}</td>
                  <td>{b.availableCopies}</td>
                  <td>{b.totalCopies - b.availableCopies}</td>
                </tr>
              ))}
              {stats.inventory.length === 0 && (
                <tr><td colSpan="7" className="center muted">No books added yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>Recent activity</h3>
        {stats.recentBorrows.length === 0 ? (
          <p className="muted">No activity yet.</p>
        ) : (
          <ul className="list">
            {stats.recentBorrows.map((b) => (
              <li key={b._id}>
                <strong>{b.student?.name || 'Deleted student'}</strong>{' '}
                {b.status === 'returned' ? 'returned' : 'borrowed'} <em>{b.book?.title || 'Deleted book'}</em>
                <small className="muted"> · {formatDateTime(b.status === 'returned' ? b.returnDate : b.issueDate)}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
