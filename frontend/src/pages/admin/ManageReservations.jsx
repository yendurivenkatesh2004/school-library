import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getError } from '../../api/api.js';
import Loader from '../../components/Loader.jsx';
import SearchSelect from '../../components/SearchSelect.jsx';
import { formatDateTime } from '../../utils/dateUtils.js';

export default function ManageReservations() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [book, setBook] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () =>
    api
      .get('/reservations')
      .then((res) => setList(res.data))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const fetchStudents = (q) =>
    api.get('/students', { params: { search: q, active: 'true', limit: 8 } }).then((r) => r.data.students);
  const fetchBooks = (q) =>
    api.get('/books', { params: { search: q, limit: 8, sort: 'title' } }).then((r) => r.data.books);

  const handleReserve = async (e) => {
    e.preventDefault();
    if (!student || !book) return toast.error('Select a student and a book');
    setSaving(true);
    try {
      await api.post('/reservations', { studentId: student._id, bookId: book._id });
      toast.success('Book reserved');
      setStudent(null);
      setBook(null);
      load();
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (id) => {
    try {
      await api.delete(`/reservations/${id}`);
      toast.success('Reservation cancelled');
      load();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <h1>Reservations</h1>
      <p className="muted">Reserve a book for a student when all copies are issued.</p>

      <form className="card" onSubmit={handleReserve}>
        <div className="issue-grid">
          <SearchSelect
            label="Student (type name or student ID)"
            placeholder="Search student..."
            fetchOptions={fetchStudents}
            getTitle={(s) => s.name}
            getSub={(s) => `ID: ${s.studentId} · Class ${s.className}-${s.section}`}
            value={student}
            onChange={setStudent}
          />
          <SearchSelect
            label="Book (type book name or book ID)"
            placeholder="Search book..."
            fetchOptions={fetchBooks}
            getTitle={(b) => b.title}
            getSub={(b) => `ID: ${b.bookId} · ${b.availableCopies} available`}
            value={book}
            onChange={setBook}
          />
        </div>
        <button className="btn btn-primary" disabled={saving}>Reserve book</button>
      </form>

      {loading ? (
        <Loader />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Student</th><th>Parent phone</th><th>Book</th><th>Reserved on</th><th>Availability</th><th /></tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r._id}>
                  <td>
                    {r.student?.name}
                    <br />
                    <small className="muted">{r.student?.studentId} · {r.student?.className}-{r.student?.section}</small>
                  </td>
                  <td>{r.student?.parentPhone}</td>
                  <td>{r.book?.title}<br /><small className="muted">{r.book?.bookId}</small></td>
                  <td>{formatDateTime(r.createdAt)}</td>
                  <td>
                    {r.book?.availableCopies > 0 ? (
                      <span className="badge badge-green">Available now – issue it</span>
                    ) : (
                      <span className="badge badge-gray">Waiting for a return</span>
                    )}
                  </td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => cancel(r._id)}>Cancel</button></td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan="6" className="center muted">No active reservations</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
