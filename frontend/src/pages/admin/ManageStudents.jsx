import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getError } from '../../api/api.js';
import Loader from '../../components/Loader.jsx';
import Modal from '../../components/Modal.jsx';
import Pagination from '../../components/Pagination.jsx';
import DateTimeInput from '../../components/DateTimeInput.jsx';
import { formatDate, parseDMY, partsFromDate } from '../../utils/dateUtils.js';

const blankForm = () => ({
  studentId: '',
  name: '',
  className: '',
  section: '',
  enroll: partsFromDate(), // date of enrollment, defaults to today
  parentName: '',
  parentPhone: '',
});

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [searchText, setSearchText] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankForm());
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get('/students', { params: { search: query, page, limit: 10 } })
      .then((res) => {
        setStudents(res.data.students);
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

  const openAdd = () => {
    setEditingId(null);
    setForm(blankForm());
    setFormOpen(true);
  };

  const openEdit = (s) => {
    setEditingId(s._id);
    setForm({
      studentId: s.studentId,
      name: s.name,
      className: s.className,
      section: s.section,
      enroll: partsFromDate(s.enrollmentDate),
      parentName: s.parentName,
      parentPhone: s.parentPhone,
    });
    setFormOpen(true);
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    const enrolled = parseDMY(form.enroll.date);
    if (!enrolled) return toast.error('Enter the enrollment date as dd/mm/yyyy');

    const payload = {
      studentId: form.studentId,
      name: form.name,
      className: form.className,
      section: form.section,
      enrollmentDate: enrolled.toISOString(),
      parentName: form.parentName,
      parentPhone: form.parentPhone,
    };

    setSaving(true);
    try {
      if (editingId) await api.put(`/students/${editingId}`, payload);
      else await api.post('/students', payload);
      toast.success(editingId ? 'Student updated' : 'Student enrolled');
      setFormOpen(false);
      load();
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete student ${s.name} (${s.studentId})?`)) return;
    try {
      await api.delete(`/students/${s._id}`);
      toast.success('Student deleted');
      load();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <div className="section-head">
        <h1>Students</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Enroll Student</button>
      </div>

      <div className="filters">
        <input
          className="search"
          placeholder="Search by student name, student ID or parent name..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <p className="muted">{meta.total} student(s) enrolled</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student ID</th><th>Name</th><th>Class</th><th>Section</th><th>Enrolled on</th>
                  <th>Parent</th><th>Parent phone</th><th />
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}>
                    <td>{s.studentId}</td>
                    <td>{s.name}</td>
                    <td>{s.className}</td>
                    <td>{s.section}</td>
                    <td>{formatDate(s.enrollmentDate)}</td>
                    <td>{s.parentName}</td>
                    <td>{s.parentPhone}</td>
                    <td className="actions">
                      <Link
                        to={`/admin/borrows?search=${encodeURIComponent(s.studentId)}&status=all`}
                        className="btn btn-outline btn-sm"
                      >
                        Books
                      </Link>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr><td colSpan="8" className="center muted">No students found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />
        </>
      )}

      {formOpen && (
        <Modal title={editingId ? 'Edit Student' : 'Enroll New Student'} onClose={() => setFormOpen(false)}>
          <form className="form-grid" onSubmit={handleSave}>
            <div>
              <label>Student ID *</label>
              <input required value={form.studentId} onChange={set('studentId')} />
            </div>
            <div>
              <label>Student name *</label>
              <input required value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label>Class *</label>
              <input required placeholder="e.g. 8" value={form.className} onChange={set('className')} />
            </div>
            <div>
              <label>Section *</label>
              <input required placeholder="e.g. B" value={form.section} onChange={set('section')} />
            </div>
            <div className="full">
              <DateTimeInput
                label="Date of enrollment * (dd/mm/yyyy)"
                withTime={false}
                value={form.enroll}
                onChange={(enroll) => setForm({ ...form, enroll })}
              />
            </div>
            <div>
              <label>Parent name *</label>
              <input required value={form.parentName} onChange={set('parentName')} />
            </div>
            <div>
              <label>Parent phone number *</label>
              <input required inputMode="tel" value={form.parentPhone} onChange={set('parentPhone')} />
            </div>
            <div className="full">
              <button className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Save changes' : 'Enroll student'}
              </button>{' '}
              <button type="button" className="btn btn-outline" onClick={() => setFormOpen(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
