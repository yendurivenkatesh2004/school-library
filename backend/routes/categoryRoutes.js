const router = require('express').Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

const staff = [protect, authorize('admin', 'librarian')];

router.get('/', getCategories);
router.post('/', staff, createCategory);
router.put('/:id', staff, updateCategory);
router.delete('/:id', staff, deleteCategory);

module.exports = router;
