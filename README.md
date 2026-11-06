# School Library (MERN) – librarian-managed

Students do not register themselves. The **librarian enrolls each student** (a library record), then issues and receives books at the desk. All students share **one login** (`student@school.com`) on the home page to see and download **e-book links**, and nothing else. Librarians and admins add the e-book links.

## Folder structure

```
school-library/
├── backend/
│   ├── server.js, seed.js, .env, package.json
│   ├── config/db.js
│   ├── models/        User (staff), Student, Book, EBook, Category, Borrow, Reservation
│   ├── middleware/    auth.js, errorHandler.js, upload.js (book cover images)
│   ├── uploads/       created automatically; cover images are saved here
│   ├── controllers/   auth, student, book, ebook, category, borrow, reservation, user, dashboard
│   ├── routes/        one file per controller
│   └── utils/         asyncHandler, generateToken, fine
└── frontend/
    └── src/
        ├── main.jsx, App.jsx, index.css
        ├── api/api.js, context/AuthContext.jsx, utils/dateUtils.js
        ├── utils/links.js     safe-URL check, Google Drive download links
        ├── utils/images.js    cover image URL helper
        ├── components/  Layout, AdminLayout, Navbar, Footer, ProtectedRoute, BookCard,
        │                Pagination, StatusBadge, Loader, Modal, SearchSelect, DateTimeInput
        └── pages/       Home, Books, BookDetails, Login, StudentLogin, EBooks, Profile, NotFound
            └── admin/   Dashboard, ManageStudents, ManageBooks, BookForm,
                         ManageEBooks, ManageCategories, ManageBorrows, ManageReservations, ManageUsers
```

## Run

```bash
cd backend  && npm install && npm run seed && npm run dev     # http://localhost:5000
cd frontend && npm install && npm run dev                      # http://localhost:5173
```

`npm run seed` **wipes** users, students, books, borrows and reservations, then adds sample data.

| Role      | Email                | Password     |
|-----------|----------------------|--------------|
| Admin     | admin@school.com     | admin123     |
| Librarian | librarian@school.com | librarian123 |
| Student (shared by all students) | student@school.com | student123 |

## Student e-book access

- Home page -> **Student Login**: login ID `student@school.com`, password `student123` (shared by every student). The admin can change it in Librarian Panel -> **Accounts & logins** -> *Reset password*, or create the student account there (role *Student*) if it is missing.
- Logged-in students see only the **E-Books** page: search, **Read online**, and **Download** (shown only when the librarian allowed download for that e-book). Google Drive "view" links are converted to direct-download links.
- Students cannot reach any librarian page or API. The server rejects student tokens on staff routes.
- **Librarian / admin**: Librarian Panel -> **E-Books (links)** -> Add E-Book Link: title, author, category, link (http/https only), description, and a "allow students to download" tick box. Added links appear for students immediately. Edit and delete are available.

## Logos

The header shows the school logo on the left (`frontend/public/logo-indus.png`) and the 50 Years Golden Jubilee logo on the right (`frontend/public/logo-50years.png`). To change a logo, replace that file (keep the same name) and refresh the browser.

## Changing passwords

- **Your own password** (admin or librarian): Librarian Panel -> **My profile & password** (or click your name at the top). Enter the current password, then the new one twice.
- **Another account's password** (admin only): Librarian Panel -> **Accounts & logins** -> **Reset password** next to the admin, librarian or shared student account. No old password is needed.
- **Forgot everything / locked out**: on the computer running the backend, run `npm run reset-password -- admin@school.com NewPassword123` inside `backend/`.
- Passwords need at least 6 characters.

## Librarian workflow

1. **Enroll a student** (Students → Enroll Student): student name, student ID, class, section, date of enrollment (dd/mm/yyyy), parent name, parent phone number, 
2. **Add books** (Books → Add Book): book name, category, shelf, number of copies, author, book ID, and an optional **book image** (JPG, PNG or WEBP, up to 2 MB, with a preview; can be replaced or removed when editing). Books can be edited and deleted (a book with copies out cannot be deleted).
3. **Issue a book** (Issue / Return): type the student's ID or name and pick the student, type the book name or book ID and pick the book, set the **issue date (dd/mm/yyyy) and time**, click Issue. The due date is set automatically (`LOAN_DAYS`, default 14).
4. **Receive a book**: in the records table click **Submit** on the row, set the **submitted date and time**, confirm. A fine (`FINE_PER_DAY`, default ₹2) is added if it is late.
5. **Track records**: tabs for *Not returned*, *Overdue*, *Returned* and *All*. Search by student name, student ID, book name or book ID to see what a student borrowed or returned. The Students page has a "Books" button for each student's history.
6. **Reservations**: when all copies are out, reserve the book for a student; it is marked fulfilled when the book is issued to them.
7. **Dashboard**: students enrolled, total books (titles), total copies, copies available, currently borrowed, overdue, active reservations, the list of students who have not returned after the due date, and every book with its total / available / borrowed copies.

Rules: a student can hold at most `MAX_BOOKS_PER_STUDENT` books (default 3), cannot take a second copy of the same book, and cannot be issued a book while they have an overdue one.

## API summary

| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/login (staff), /api/auth/student-login (shared student account) | public |
| GET | /api/ebooks | student, librarian, admin |
| POST / PUT / DELETE | /api/ebooks | librarian, admin |
| GET / PUT | /api/auth/me, /profile, /password | logged in |
| GET | /api/books, /api/books/:id, /api/categories | public |
| POST / PUT / DELETE | /api/books, /api/categories | librarian, admin |
| GET / POST / PUT / DELETE | /api/students | librarian, admin |
| GET / POST | /api/borrows | librarian, admin |
| PUT | /api/borrows/:id/return | librarian, admin |
| GET / POST / DELETE | /api/reservations | librarian, admin |
| GET | /api/dashboard | librarian, admin |
| GET / POST / PUT / DELETE | /api/users (staff accounts) | admin |

## Before going live

Change `JWT_SECRET` and the seeded passwords, set `NODE_ENV=production`, set `CLIENT_URL` and `VITE_API_URL`, and use a managed MongoDB (Atlas) with backups.

## Works on all devices

The site adapts to phones (iPhone, iPod touch, Android), tablets (iPad, Android tablets), laptops and desktops, in portrait and landscape.

- Phones: menu becomes a ☰ button, tables become cards, dialogs slide up from the bottom, the librarian menu is a sideways-scrolling tab strip.
- Tablets: same layout with the tab strip; stat cards and book grids use more columns.
- Laptops / desktops: full sidebar and wide tables.
- Touch screens get bigger tap targets and 16px inputs (stops iPhone auto-zoom); notched phones are respected.
