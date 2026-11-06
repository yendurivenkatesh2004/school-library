const router = require('express').Router();
const { issueBook, returnBook, getBorrows } = require('../controllers/borrowController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin', 'librarian'));

router.get('/', getBorrows);
router.post('/', issueBook);
router.put('/:id/return', returnBook);

module.exports = router;
