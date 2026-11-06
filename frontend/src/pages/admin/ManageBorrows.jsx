import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getError } from '../../api/api.js';
import Loader from '../../components/Loader.jsx';
import Modal from '../../components/Modal.jsx';
import Pagination from '../../components/Pagination.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import SearchSelect from '../../components/SearchSelect.jsx';
import DateTimeInput from '../../components/DateTimeInput.jsx';
import { dateFromParts, formatDate, formatDateTime, partsFromDate } from '../../utils/dateUtils.js';

const TABS = [
  ['borrowed', 'Not returned'],
  ['overdue', 'Overdue'],
  ['returned', 'Returned'],
  ['all', 'All records'],
];

export default function ManageBorrows() {
  const [params] = useSearchParams();

  // ----- Issue form -----
  const [student, setStudent] = useState(null);
  const [book, setBook] = useState(null);
  const [issueAt, setIssueAt] = useState(partsFromDate());
  const [issuing, setIssuing] = useState(false);

  // ----- Records list -----
  const [status, setStatus] = useState(params.get('status') || 'borrowed');
  const [searchText, setSearchText] = useState(params.get('search') || '');
  const [query, setQuery] = useState(params.get('search') || '');
  const [page, setPage] = useState(1);
  const [borrows, setBorrows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // ----- Return (submit) dialog -----
  const [returning, setReturning] = useState(null);
  const [returnAt, setReturnAt] = useState(partsFromDate());
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get('/borrows', {
        params: {
          status: status === 'all' ? undefined : status,
          search: query || undefined,
          page,
          limit: 10,
        },
      })
      .then((res) => {
        setBorrows(res.data.borrows);
        setMeta({ page: res.data.page, pages: res.data.pages, total: res.data.total });
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [status, query, page]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setQuery(searchText);
    }, 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const fetchStudents = (q) =>
    api.get('/students', { params: { search: q, active: 'true', limit: 8 } }).then((r) => r.data.students);
  const fetchBooks = (q) =>
    api.get('/books', { params: { search: q, available: 'true', limit: 8, sort: 'title' } }).then((r) => r.data.books);

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!student || !book) return toast.error('Select a student and a book');
    const when = dateFromParts(issueAt.date, issueAt.time);
    if (!when) return toast.error('Enter the issue date as dd/mm/yyyy and a valid time');

    setIssuing(true);
    try {
      const { data } = await api.post('/borrows', {
        studentId: student._id,
        bookId: book._id,
        issueDate: when.toISOString(),
      });
      toast.success(`Issued "${data.book.title}" to ${data.student.name}. Due on ${formatDate(data.dueDate)}`);
      setStudent(null);
      setBook(null);
      setIssueAt(partsFromDate());
      load();
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setIssuing(false);
    }
  };

  const openReturn = (b) => {
    setReturning(b);
    setReturnAt(partsFromDate());
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    const when = dateFromParts(returnAt.date, returnAt.time);
    if (!when) return toast.error('Enter the submitted date as dd/mm/yyyy and a valid time');

    setSubmitting(true);
    try {
      const { data } = await api.put(`/borrows/${returning._id}/return`, { returnDate: when.toISOString() });
      toast.success(data.fine > 0 ? `Book submitted. Fine to collect: ₹${data.fine}` : 'Book submitted. No fine.');
      setReturning(null);
      load();
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Issue / Return</h1>

      <form className="card" onSubmit={handleIssue}>
        <h3>Issue a book</h3>
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
            placeholder="Search available book..."
            fetchOptions={fetchBooks}
            getTitle={(b) => b.title}
            getSub={(b) => `ID: ${b.bookId} · ${b.author} · ${b.availableCopies} available`}
            value={book}
            onChange={setBook}
          />
          <DateTimeInput label="Issue date and time (dd/mm/yyyy)" value={issueAt} onChange={setIssueAt} />
        </div>
        <button className="btn btn-primary" disabled={issuing}>
          {issuing ? 'Issuing...' : 'Issue book'}
        </button>
      </form>

      <div className="card">
        <h3>Borrow records</h3>
        <div className="filters">
          <input
            className="search"
            placeholder="Search by student name, student ID, book name or book ID..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div className="tabs">
          {TABS.map(([val, label]) => (
            <button
              key={val}
              className={status === val ? 'active' : ''}
              onClick={() => {
                setStatus(val);
                setPage(1);
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <Loader />
        ) : (
          <>
            <p className="muted">{meta.total} record(s)</p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th><th>Book</th><th>Issued (date, time)</th><th>Due date</th>
                    <th>Submitted (date, time)</th><th>Status</th><th>Fine</th><th />
                  </tr>
                </thead>
                <tbody>
                  {borrows.map((b) => (
                    <tr key={b._id}>
                      <td>
                        {b.student?.name || 'Deleted student'}
                        <br />
                        <small className="muted">
                          {b.student?.studentId} · {b.student?.className}-{b.student?.section}
                        </small>
                      </td>
                      <td>
                        {b.book?.title || 'Deleted book'}
                        <br />
                        <small className="muted">{b.book?.bookId}</small>
                      </td>
                      <td>{formatDateTime(b.issueDate)}</td>
                      <td>{formatDate(b.dueDate)}</td>
                      <td>{b.returnDate ? formatDateTime(b.returnDate) : '-'}</td>
                      <td><StatusBadge borrow={b} /></td>
                      <td>{b.currentFine ? `₹${b.currentFine}` : '-'}</td>
                      <td>
                        {b.status === 'borrowed' && (
                          <button className="btn btn-primary btn-sm" onClick={() => openReturn(b)}>
                            Submit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {borrows.length === 0 && (
                    <tr><td colSpan="8" className="center muted">No records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />
          </>
        )}
      </div>

      {returning && (
        <Modal title="Submit returned book" onClose={() => setReturning(null)}>
          <form onSubmit={handleReturn}>
            <p>
              <strong>{returning.book?.title}</strong> ({returning.book?.bookId})
              <br />
              returned by <strong>{returning.student?.name}</strong> ({returning.student?.studentId})
            </p>
            <p className="muted">
              Issued {formatDateTime(returning.issueDate)} · Due {formatDate(returning.dueDate)}
            </p>
            <DateTimeInput label="Submitted date and time (dd/mm/yyyy)" value={returnAt} onChange={setReturnAt} />
            <p className="muted" style={{ marginTop: '0.8rem' }}>
              A fine is added automatically if the book is submitted after the due date.
            </p>
            <div style={{ marginTop: '1rem' }}>
              <button className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Confirm submission'}
              </button>{' '}
              <button type="button" className="btn btn-outline" onClick={() => setReturning(null)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
