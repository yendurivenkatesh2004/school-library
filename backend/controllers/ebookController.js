const EBook = require('../models/EBook');
const asyncHandler = require('../utils/asyncHandler');
const { escapeRegex } = require('../utils/fine');

const pick = (body) => {
  const data = {};
  ['title', 'author', 'description', 'link'].forEach((k) => {
    if (body[k] !== undefined) data[k] = body[k];
  });
  if ('category' in body) data.category = body.category || undefined;
  if (body.allowDownload !== undefined) data.allowDownload = Boolean(body.allowDownload);
  return data;
};

// GET /api/ebooks?search=&category=&page=1&limit=12   (students and staff)
exports.getEBooks = asyncHandler(async (req, res) => {
  const { search, category, page = 1, limit = 12 } = req.query;
  const filter = {};

  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ title: rx }, { author: rx }, { description: rx }];
  }
  if (category) filter.category = category;

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 200);

  const [ebooks, total] = await Promise.all([
    EBook.find(filter)
      .populate('category', 'name')
      .sort('-createdAt')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    EBook.countDocuments(filter),
  ]);

  res.json({ ebooks, page: pageNum, pages: Math.ceil(total / limitNum), total });
});

// POST /api/ebooks   (librarian / admin)
exports.createEBook = asyncHandler(async (req, res) => {
  const ebook = await EBook.create({ ...pick(req.body), addedBy: req.user._id });
  res.status(201).json(await ebook.populate('category', 'name'));
});

// PUT /api/ebooks/:id   (librarian / admin)
exports.updateEBook = asyncHandler(async (req, res) => {
  const ebook = await EBook.findById(req.params.id);
  if (!ebook) {
    res.status(404);
    throw new Error('E-book not found');
  }
  Object.assign(ebook, pick(req.body));
  await ebook.save();
  res.json(await ebook.populate('category', 'name'));
});

// DELETE /api/ebooks/:id   (librarian / admin)
exports.deleteEBook = asyncHandler(async (req, res) => {
  const ebook = await EBook.findByIdAndDelete(req.params.id);
  if (!ebook) {
    res.status(404);
    throw new Error('E-book not found');
  }
  res.json({ message: 'E-book deleted' });
});
