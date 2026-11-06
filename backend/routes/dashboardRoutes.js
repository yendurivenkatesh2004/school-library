const router = require('express').Router();
const { getStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin', 'librarian'), getStats);

module.exports = router;
