const router = require('express').Router();
const {
  createReservation,
  getReservations,
  cancelReservation,
} = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin', 'librarian'));

router.get('/', getReservations);
router.post('/', createReservation);
router.delete('/:id', cancelReservation);

module.exports = router;
