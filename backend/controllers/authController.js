const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');

const payload = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  phone: u.phone,
});

// Shared by both login endpoints; allowStudent says which kind of account may use it
const doLogin = (allowStudent) =>
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required');
    }
    const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }
    if (!user.isActive) {
      res.status(403);
      throw new Error('This account is deactivated. Contact the librarian.');
    }
    if ((user.role === 'student') !== allowStudent) {
      res.status(403);
      throw new Error(
        allowStudent
          ? 'This is not the student account. Use the Librarian Login instead.'
          : 'This is the student account. Use the Student Login instead.'
      );
    }
    res.json({ token: generateToken(user._id), user: payload(user) });
  });

// POST /api/auth/login          (librarian / admin)
exports.login = doLogin(false);

// POST /api/auth/student-login  (the shared student account)
exports.studentLogin = doLogin(true);

// GET /api/auth/me   (any logged-in account)
exports.getMe = asyncHandler(async (req, res) => {
  res.json(payload(req.user));
});

// PUT /api/auth/profile   (staff)
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  if (name) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  await req.user.save();
  res.json(payload(req.user));
});

// PUT /api/auth/password   (staff)
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!currentPassword || !newPassword || !(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }
  if (currentPassword === newPassword) {
    res.status(400);
    throw new Error('The new password must be different from the current one');
  }
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated successfully' });
});
