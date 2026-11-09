const router = require('express').Router();
const {
  getEBooks,
  createEBook,
  updateEBook,
  deleteEBook,
} = require('../controllers/ebookController');
const { protect, protectAny, authorize } = require('../middleware/auth');
const uploadCover = require('../middleware/upload');

// Students and staff can see the links
router.get('/', protectAny, getEBooks);

// Only the librarian / admin can add, change or remove them
router.post('/', protect, authorize('admin', 'librarian'), uploadCover, createEBook);
router.put('/:id', protect, authorize('admin', 'librarian'), uploadCover, updateEBook);
router.delete('/:id', protect, authorize('admin', 'librarian'), deleteEBook);

module.exports = router;
