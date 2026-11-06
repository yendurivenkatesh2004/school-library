// Run once:  npm run seed      (WARNING: wipes users, students, books, borrows and reservations)
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');
const Category = require('./models/Category');
const Book = require('./models/Book');
const Borrow = require('./models/Borrow');
const Reservation = require('./models/Reservation');
const EBook = require('./models/EBook');

const models = [User, Student, Category, Book, Borrow, Reservation, EBook];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  console.log('Clearing old data...');
  // Dropping the collections also removes old indexes (e.g. the old unique "isbn" index)
  for (const model of models) {
    try {
      await model.collection.drop();
    } catch (e) {
      /* collection did not exist yet */
    }
  }
  await Promise.all(models.map((m) => m.syncIndexes()));

  // create() so the password hashing hook runs
  await User.create([
    { name: 'Admin', email: 'admin@school.com', password: 'admin123', role: 'admin' },
    { name: 'Head Librarian', email: 'librarian@school.com', password: 'librarian123', role: 'librarian' },
    { name: 'Students', email: 'student@school.com', password: 'student123', role: 'student' }, // shared login for all students (e-books only)
  ]);

  const cats = await Category.insertMany([
    { name: 'Science' },
    { name: 'Mathematics' },
    { name: 'Literature' },
    { name: 'History' },
    { name: 'Reference' },
  ]);
  const c = Object.fromEntries(cats.map((x) => [x.name, x._id]));

  const books = [
    ['A Brief History of Time', 'BK-001', 'Stephen Hawking', 'Science', 'A-01', 3],
    ['The Selfish Gene', 'BK-002', 'Richard Dawkins', 'Science', 'A-02', 2],
    ['Mathematics for Class 8', 'BK-003', 'R. D. Sharma', 'Mathematics', 'B-05', 5],
    ['The Number Devil', 'BK-004', 'Hans Magnus Enzensberger', 'Mathematics', 'B-06', 2],
    ['To Kill a Mockingbird', 'BK-005', 'Harper Lee', 'Literature', 'C-10', 4],
    ['Wings of Fire', 'BK-006', 'A. P. J. Abdul Kalam', 'Literature', 'C-11', 6],
    ['Discovery of India', 'BK-007', 'Jawaharlal Nehru', 'History', 'D-03', 2],
    ['Oxford English Dictionary (Concise)', 'BK-008', 'Oxford', 'Reference', 'R-01', 3],
  ];
  await Book.insertMany(
    books.map(([title, bookId, author, cat, shelfLocation, copies]) => ({
      title,
      bookId,
      author,
      category: c[cat],
      shelfLocation,
      totalCopies: copies,
      availableCopies: copies,
    }))
  );

  await Student.insertMany([
    { studentId: 'STU-1001', name: 'Anil Kumar', className: '8', section: 'B', parentName: 'Ramesh Kumar', parentPhone: '9876543210' },
    { studentId: 'STU-1002', name: 'Priya Reddy', className: '9', section: 'A', parentName: 'Suresh Reddy', parentPhone: '9123456780' },
    { studentId: 'STU-1003', name: 'Rahul Sharma', className: '10', section: 'C', parentName: 'Vijay Sharma', parentPhone: '9988776655' },
  ]);

  // Sample e-book links (replace with your own from the Librarian Panel -> E-Books)
  await EBook.insertMany([
    { title: 'Alice\'s Adventures in Wonderland', author: 'Lewis Carroll', category: c.Literature, description: 'Classic children\'s novel (public domain).', link: 'https://www.gutenberg.org/ebooks/11', allowDownload: true },
    { title: 'The Elements of Euclid', author: 'Euclid', category: c.Mathematics, description: 'Foundations of geometry (public domain).', link: 'https://www.gutenberg.org/ebooks/21076', allowDownload: false },
  ]);

  console.log('Seed complete. Staff logins:');
  console.log('  admin@school.com / admin123');
  console.log('  librarian@school.com / librarian123');
  console.log('  student@school.com / student123   (shared login for all students, e-books only)');
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
