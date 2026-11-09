const router = require('express').Router();
const { issueBook, returnBook, getBorrows, getSettings, deleteBorrow, bulkDeleteBorrows } = require('../controllers/borrowController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin', 'librarian'));

router.get('/settings', getSettings);
router.get('/', getBorrows);
router.post('/', issueBook);
router.put('/:id/return', returnBook);
router.post('/bulk-delete', bulkDeleteBorrows);
router.delete('/:id', deleteBorrow);

module.exports = router;
