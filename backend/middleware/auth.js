const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Verifies the JWT and attaches req.user and req.role ('admin' | 'librarian' | 'student')
const loadUser = async (req, res) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
  const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    res.status(401);
    throw new Error('User not found or account deactivated');
  }
  req.user = user;
  req.role = user.role;
};

// Librarian / admin only. The shared student account is rejected here.
exports.protect = asyncHandler(async (req, res, next) => {
  await loadUser(req, res);
  if (req.role === 'student') {
    res.status(403);
    throw new Error('Students are not allowed to access this resource');
  }
  next();
});

// Any logged-in account, including the student account (used for e-books)
exports.protectAny = asyncHandler(async (req, res, next) => {
  await loadUser(req, res);
  next();
});

// Role guard: authorize('admin', 'librarian')
exports.authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.role)) {
      res.status(403);
      throw new Error(`Role '${req.role}' is not allowed to access this resource`);
    }
    next();
  };
