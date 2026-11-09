const EBook = require('../models/EBook');
const asyncHandler = require('../utils/asyncHandler');
const { escapeRegex } = require('../utils/fine');
const { coverPath, removeCover } = require('../utils/coverFiles');

const pick = (body) => {
  const data = {};
  ['title', 'author', 'description', 'link'].forEach((k) => {
    if (body[k] !== undefined) data[k] = body[k];
  });
  if ('category' in body) data.category = body.category || undefined;
  // multipart forms send booleans as the text "true" / "false"
  if (body.allowDownload !== undefined) data.allowDownload = body.allowDownload === true || body.allowDownload === 'true';
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

// POST /api/ebooks   (librarian / admin)  - multipart form, optional file field "cover"
exports.createEBook = asyncHandler(async (req, res) => {
  const data = { ...pick(req.body), addedBy: req.user._id };
  if (req.file) data.coverImage = coverPath(req.file.filename);
  try {
    const ebook = await EBook.create(data);
    res.status(201).json(await ebook.populate('category', 'name'));
  } catch (err) {
    await removeCover(data.coverImage); // do not leave an orphan file behind
    throw err;
  }
});

// PUT /api/ebooks/:id   (librarian / admin)  - a new "cover" replaces the old one; removeCover=true deletes it
exports.updateEBook = asyncHandler(async (req, res) => {
  const newCover = req.file ? coverPath(req.file.filename) : undefined;
  try {
    const ebook = await EBook.findById(req.params.id);
    if (!ebook) {
      res.status(404);
      throw new Error('E-book not found');
    }
    Object.assign(ebook, pick(req.body));

    const oldCover = ebook.coverImage;
    const removing = !newCover && String(req.body.removeCover) === 'true';
    if (newCover) ebook.coverImage = newCover;
    else if (removing) ebook.coverImage = undefined;

    await ebook.save();
    if (newCover || removing) await removeCover(oldCover); // only after the save worked
    res.json(await ebook.populate('category', 'name'));
  } catch (err) {
    await removeCover(newCover); // the update failed, drop the file that was just uploaded
    throw err;
  }
});

// DELETE /api/ebooks/:id   (librarian / admin)
exports.deleteEBook = asyncHandler(async (req, res) => {
  const ebook = await EBook.findByIdAndDelete(req.params.id);
  if (!ebook) {
    res.status(404);
    throw new Error('E-book not found');
  }
  await removeCover(ebook.coverImage);
  res.json({ message: 'E-book deleted' });
});
