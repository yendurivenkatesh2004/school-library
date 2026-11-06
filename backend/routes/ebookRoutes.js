const router = require('express').Router();
const {
  getEBooks,
  createEBook,
  updateEBook,
  deleteEBook,
} = require('../controllers/ebookController');
const { protect, protectAny, authorize } = require('../middleware/auth');

// Students and staff can see the links
router.get('/', protectAny, getEBooks);

// Only the librarian / admin can add, change or remove them
router.post('/', protect, authorize('admin', 'librarian'), createEBook);
router.put('/:id', protect, authorize('admin', 'librarian'), updateEBook);
router.delete('/:id', protect, authorize('admin', 'librarian'), deleteEBook);

module.exports = router;
