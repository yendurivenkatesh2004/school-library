const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const clean = (user) => ({ ...user.toObject(), password: undefined });

// GET /api/users   (admin) - staff accounts
exports.getUsers = asyncHandler(async (req, res) => {
  res.json(await User.find().sort('-createdAt'));
});

// POST /api/users   (admin) - create a librarian or admin account
exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  const user = await User.create({ name, email, password, role, phone });
  res.status(201).json(clean(user));
});

// PUT /api/users/:id   (admin)
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const { name, email, role, isActive, phone, password } = req.body;

  if (String(user._id) === String(req.user._id) && (role !== undefined || isActive === false)) {
    res.status(400);
    throw new Error('You cannot change your own role or deactivate yourself');
  }

  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (phone !== undefined) user.phone = phone;
  if (password) user.password = password;

  await user.save();
  res.json(clean(user));
});

// DELETE /api/users/:id   (admin)
exports.deleteUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ message: 'User deleted' });
});
