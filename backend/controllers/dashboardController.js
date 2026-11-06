const Book = require('../models/Book');
const Student = require('../models/Student');
const Borrow = require('../models/Borrow');
const Reservation = require('../models/Reservation');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/dashboard  (librarian / admin)
exports.getStats = asyncHandler(async (req, res) => {
  const now = new Date();

  const [
    totalStudents,
    totalTitles,
    copiesAgg,
    currentlyBorrowed,
    overdue,
    activeReservations,
    overdueList,
    recentBorrows,
    inventory,
  ] = await Promise.all([
    Student.countDocuments(),
    Book.countDocuments(),
    Book.aggregate([
      { $group: { _id: null, total: { $sum: '$totalCopies' }, available: { $sum: '$availableCopies' } } },
    ]),
    Borrow.countDocuments({ status: 'borrowed' }),
    Borrow.countDocuments({ status: 'borrowed', dueDate: { $lt: now } }),
    Reservation.countDocuments({ status: 'active' }),
    // Not returned after the due date
    Borrow.find({ status: 'borrowed', dueDate: { $lt: now } })
      .populate('student', 'name studentId className section parentPhone')
      .populate('book', 'title bookId')
      .sort('dueDate')
      .limit(10),
    Borrow.find()
      .populate('student', 'name studentId')
      .populate('book', 'title bookId')
      .sort('-updatedAt')
      .limit(8),
    // Every book with its copies
    Book.find()
      .select('title bookId author shelfLocation totalCopies availableCopies')
      .populate('category', 'name')
      .sort('title')
      .limit(500),
  ]);

  res.json({
    totalStudents,
    totalTitles,
    totalCopies: copiesAgg[0]?.total || 0,
    availableCopies: copiesAgg[0]?.available || 0,
    currentlyBorrowed,
    overdue,
    activeReservations,
    overdueList,
    recentBorrows,
    inventory,
  });
});
