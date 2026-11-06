const Book = require('../models/Book');
const Borrow = require('../models/Borrow');
const Student = require('../models/Student');
const Reservation = require('../models/Reservation');
const asyncHandler = require('../utils/asyncHandler');
const { calculateFine, addDays, escapeRegex } = require('../utils/fine');

const loanDays = () => Number(process.env.LOAN_DAYS) || 14;
const maxBooks = () => Number(process.env.MAX_BOOKS_PER_STUDENT) || 3;

// Reads an ISO date-time sent by the frontend (defaults to "now")
const parseDateTime = (value, res, label) => {
  if (!value) return new Date();
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    res.status(400);
    throw new Error(`Invalid ${label} date/time`);
  }
  return d;
};

// POST /api/borrows   body: { studentId, bookId, issueDate }   (all _id values)
exports.issueBook = asyncHandler(async (req, res) => {
  const { studentId, bookId } = req.body;
  if (!studentId || !bookId) {
    res.status(400);
    throw new Error('Select a student and a book');
  }

  const issuedAt = parseDateTime(req.body.issueDate, res, 'issue');
  if (issuedAt.getTime() > Date.now() + 5 * 60 * 1000) {
    res.status(400);
    throw new Error('Issue date/time cannot be in the future');
  }

  const student = await Student.findById(studentId);
  if (!student || !student.isActive) {
    res.status(404);
    throw new Error('Student not found or not active');
  }

  const active = await Borrow.find({ student: studentId, status: 'borrowed' });
  if (active.length >= maxBooks()) {
    res.status(400);
    throw new Error(`${student.name} already has ${maxBooks()} books (the limit). A book must be returned first.`);
  }
  if (active.some((b) => String(b.book) === String(bookId))) {
    res.status(400);
    throw new Error('This student already has a copy of this book');
  }
  if (active.some((b) => b.dueDate < new Date())) {
    res.status(400);
    throw new Error(`${student.name} has overdue books. They must be returned before issuing new ones.`);
  }

  // Atomic decrement so two librarians cannot issue the last copy twice
  const book = await Book.findOneAndUpdate(
    { _id: bookId, availableCopies: { $gt: 0 } },
    { $inc: { availableCopies: -1 } },
    { new: true }
  );
  if (!book) {
    res.status(400);
    throw new Error('No copies of this book are available right now');
  }

  let borrow;
  try {
    borrow = await Borrow.create({
      student: studentId,
      book: bookId,
      issueDate: issuedAt,
      dueDate: addDays(issuedAt, loanDays()),
      issuedBy: req.user._id,
    });
  } catch (err) {
    await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: 1 } }); // undo
    throw err;
  }

  await Reservation.updateMany({ student: studentId, book: bookId, status: 'active' }, { status: 'fulfilled' });

  await borrow.populate([
    { path: 'book', select: 'title bookId' },
    { path: 'student', select: 'name studentId' },
  ]);
  res.status(201).json(borrow);
});

// PUT /api/borrows/:id/return   body: { returnDate }  (submitted date + time)
exports.returnBook = asyncHandler(async (req, res) => {
  const borrow = await Borrow.findById(req.params.id);
  if (!borrow) {
    res.status(404);
    throw new Error('Borrow record not found');
  }
  if (borrow.status === 'returned') {
    res.status(400);
    throw new Error('This book has already been returned');
  }

  const returnedAt = parseDateTime(req.body.returnDate, res, 'return');
  if (returnedAt < borrow.issueDate) {
    res.status(400);
    throw new Error('Return date/time cannot be before the issue date/time');
  }
  if (returnedAt.getTime() > Date.now() + 5 * 60 * 1000) {
    res.status(400);
    throw new Error('Return date/time cannot be in the future');
  }

  borrow.returnDate = returnedAt;
  borrow.fine = calculateFine(borrow.dueDate, returnedAt);
  borrow.status = 'returned';
  borrow.returnedBy = req.user._id;
  await borrow.save();

  await Book.findByIdAndUpdate(borrow.book, { $inc: { availableCopies: 1 } });

  await borrow.populate([
    { path: 'book', select: 'title bookId' },
    { path: 'student', select: 'name studentId' },
  ]);
  res.json(borrow);
});

// GET /api/borrows?status=borrowed|overdue|returned&search=&page=1&limit=10
//   borrowed = not returned yet (includes overdue), overdue = not returned and past due date
//   search matches student name / student ID / book name / book ID
exports.getBorrows = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 10 } = req.query;
  const filter = {};

  if (status === 'overdue') {
    filter.status = 'borrowed';
    filter.dueDate = { $lt: new Date() };
  } else if (status === 'borrowed' || status === 'returned') {
    filter.status = status;
  }

  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    const [students, books] = await Promise.all([
      Student.find({ $or: [{ name: rx }, { studentId: rx }] }).select('_id'),
      Book.find({ $or: [{ title: rx }, { bookId: rx }] }).select('_id'),
    ]);
    filter.$or = [
      { student: { $in: students.map((s) => s._id) } },
      { book: { $in: books.map((b) => b._id) } },
    ];
  }

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 100);

  const [borrows, total] = await Promise.all([
    Borrow.find(filter)
      .populate('student', 'name studentId className section parentPhone')
      .populate('book', 'title bookId author')
      .sort('-issueDate')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Borrow.countDocuments(filter),
  ]);

  res.json({ borrows, page: pageNum, pages: Math.ceil(total / limitNum), total });
});
