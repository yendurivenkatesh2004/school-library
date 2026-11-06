const Category = require('../models/Category');
const Book = require('../models/Book');
const EBook = require('../models/EBook');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/categories
exports.getCategories = asyncHandler(async (req, res) => {
  res.json(await Category.find().sort('name'));
});

// POST /api/categories
exports.createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json(category);
});

// PUT /api/categories/:id
exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  res.json(category);
});

// DELETE /api/categories/:id
exports.deleteCategory = asyncHandler(async (req, res) => {
  if (
    (await Book.exists({ category: req.params.id })) ||
    (await EBook.exists({ category: req.params.id }))
  ) {
    res.status(400);
    throw new Error('Cannot delete a category that still has books or e-books');
  }
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  res.json({ message: 'Category deleted' });
});
