const Book = require('../models/Book');
const Borrow = require('../models/Borrow');
const Reservation = require('../models/Reservation');
const asyncHandler = require('../utils/asyncHandler');
const { escapeRegex } = require('../utils/fine');
const { coverPath, removeCover } = require('../utils/coverFiles');

const pickBook = (body) => {
  const data = {};
  ['title', 'bookId', 'author', 'shelfLocation'].forEach((k) => {
    if (body[k] !== undefined) data[k] = body[k];
  });
  return data;
};

// GET /api/books?search=&category=&available=true&page=1&limit=12&sort=-createdAt
exports.getBooks = asyncHandler(async (req, res) => {
  const { search, category, available, page = 1, limit = 12, sort = '-createdAt' } = req.query;
  const filter = {};

  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ title: rx }, { author: rx }, { bookId: rx }];
  }
  if (category) filter.category = category;
  if (available === 'true') filter.availableCopies = { $gt: 0 };

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 500);

  const [books, total] = await Promise.all([
    Book.find(filter)
      .populate('category', 'name')
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Book.countDocuments(filter),
  ]);

  res.json({ books, page: pageNum, pages: Math.ceil(total / limitNum), total });
});

// GET /api/books/:id
exports.getBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id).populate('category', 'name');
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }
  res.json(book);
});

// POST /api/books  (librarian)  - multipart form, optional file field "cover"
exports.createBook = asyncHandler(async (req, res) => {
  const data = pickBook(req.body);
  if (req.body.category) data.category = req.body.category;
  data.totalCopies = Number(req.body.totalCopies) || 1;
  data.availableCopies = data.totalCopies;
  if (req.file) data.coverImage = coverPath(req.file.filename);

  try {
    const book = await Book.create(data);
    res.status(201).json(book);
  } catch (err) {
    await removeCover(data.coverImage); // do not leave an orphan file behind
    throw err;
  }
});

// PUT /api/books/:id  (librarian)  - new "cover" file replaces the old one; removeCover=true deletes it
exports.updateBook = asyncHandler(async (req, res) => {
  const newCover = req.file ? coverPath(req.file.filename) : undefined;

  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      res.status(404);
      throw new Error('Book not found');
    }

    Object.assign(book, pickBook(req.body));
    if ('category' in req.body) book.category = req.body.category || undefined;

    // availableCopies is managed by issue/return, so adjust it from the change in total copies
    if (req.body.totalCopies !== undefined) {
      const newTotal = Number(req.body.totalCopies);
      const issued = book.totalCopies - book.availableCopies;
      if (!newTotal || newTotal < issued) {
        res.status(400);
        throw new Error(`${issued} copies are currently issued, so total copies cannot be below ${issued}`);
      }
      book.totalCopies = newTotal;
      book.availableCopies = newTotal - issued;
    }

    const oldCover = book.coverImage;
    const removing = !newCover && String(req.body.removeCover) === 'true';
    if (newCover) book.coverImage = newCover;
    else if (removing) book.coverImage = undefined;

    await book.save();
    if (newCover || removing) await removeCover(oldCover); // only after the save worked
    res.json(book);
  } catch (err) {
    await removeCover(newCover); // the update failed, drop the file that was just uploaded
    throw err;
  }
});

// DELETE /api/books/:id  (librarian)
exports.deleteBook = asyncHandler(async (req, res) => {
  if (await Borrow.exists({ book: req.params.id, status: 'borrowed' })) {
    res.status(400);
    throw new Error('Some copies of this book are currently borrowed, so it cannot be deleted');
  }
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }
  await removeCover(book.coverImage);
  await Reservation.updateMany({ book: req.params.id, status: 'active' }, { status: 'cancelled' });
  res.json({ message: 'Book deleted' });
});
