const router = require('express').Router();
const {
  login,
  studentLogin,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const { protect, protectAny } = require('../middleware/auth');

router.post('/login', login); // librarian / admin
router.post('/student-login', studentLogin); // students
router.get('/me', protectAny, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

module.exports = router;
