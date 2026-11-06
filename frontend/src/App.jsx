import { Routes, Route } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminLayout from './components/AdminLayout.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import StudentLogin from './pages/StudentLogin.jsx';
import Books from './pages/Books.jsx';
import BookDetails from './pages/BookDetails.jsx';
import EBooks from './pages/EBooks.jsx';
import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';

import Dashboard from './pages/admin/Dashboard.jsx';
import ManageStudents from './pages/admin/ManageStudents.jsx';
import ManageBooks from './pages/admin/ManageBooks.jsx';
import BookForm from './pages/admin/BookForm.jsx';
import ManageEBooks from './pages/admin/ManageEBooks.jsx';
import ManageCategories from './pages/admin/ManageCategories.jsx';
import ManageBorrows from './pages/admin/ManageBorrows.jsx';
import ManageReservations from './pages/admin/ManageReservations.jsx';
import ManageUsers from './pages/admin/ManageUsers.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public: catalogue and logins */}
        <Route path="/" element={<Home />} />
        <Route path="/books" element={<Books />} />
        <Route path="/books/:id" element={<BookDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student-login" element={<StudentLogin />} />

        {/* Students and staff: e-book links */}
        <Route element={<ProtectedRoute roles={['student', 'admin', 'librarian']} loginPath="/student-login" />}>
          <Route path="/ebooks" element={<EBooks />} />
        </Route>

        {/* Staff only */}
        <Route element={<ProtectedRoute roles={['admin', 'librarian']} />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="books" element={<ManageBooks />} />
            <Route path="books/new" element={<BookForm />} />
            <Route path="books/:id/edit" element={<BookForm />} />
            <Route path="ebooks" element={<ManageEBooks />} />
            <Route path="categories" element={<ManageCategories />} />
            <Route path="borrows" element={<ManageBorrows />} />
            <Route path="reservations" element={<ManageReservations />} />

            {/* Admin only */}
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="staff" element={<ManageUsers />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
