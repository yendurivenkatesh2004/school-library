const Book = require('../models/Book');
const Student = require('../models/Student');
const Borrow = require('../models/Borrow');
const Reservation = require('../models/Reservation');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/reservations   body: { studentId, bookId }   (librarian reserves for a student)
exports.createReservation = asyncHandler(async (req, res) => {
  const { studentId, bookId } = req.body;
  const [student, book] = await Promise.all([Student.findById(studentId), Book.findById(bookId)]);

  if (!student || !student.isActive) {
    res.status(404);
    throw new Error('Student not found or not active');
  }
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }
  if (book.availableCopies > 0) {
    res.status(400);
    throw new Error('Copies are available - issue the book directly instead of reserving');
  }
  if (await Borrow.exists({ student: studentId, book: bookId, status: 'borrowed' })) {
    res.status(400);
    throw new Error('This student already has this book');
  }
  if (await Reservation.exists({ student: studentId, book: bookId, status: 'active' })) {
    res.status(400);
    throw new Error('This student has already reserved this book');
  }

  const reservation = await Reservation.create({ student: studentId, book: bookId, createdBy: req.user._id });
  res.status(201).json(reservation);
});

// GET /api/reservations   (active reservations, oldest first)
exports.getReservations = asyncHandler(async (req, res) => {
  const list = await Reservation.find({ status: 'active' })
    .populate('student', 'name studentId className section parentPhone')
    .populate('book', 'title bookId availableCopies')
    .sort('createdAt');
  res.json(list);
});

// DELETE /api/reservations/:id   (cancel)
exports.cancelReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) {
    res.status(404);
    throw new Error('Reservation not found');
  }
  reservation.status = 'cancelled';
  await reservation.save();
  res.json({ message: 'Reservation cancelled' });
});
