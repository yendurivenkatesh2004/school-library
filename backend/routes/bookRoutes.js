const router = require('express').Router();
const { getBooks, getBook, createBook, updateBook, deleteBook } = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/auth');
const uploadCover = require('../middleware/upload');

const staff = [protect, authorize('admin', 'librarian')];

router.get('/', getBooks);
router.get('/:id', getBook);
// Auth runs first, then the optional cover image is accepted
router.post('/', staff, uploadCover, createBook);
router.put('/:id', staff, uploadCover, updateBook);
router.delete('/:id', staff, deleteBook);

module.exports = router;
