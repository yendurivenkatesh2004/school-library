// Recovery tool for when nobody can log in (e.g. the admin forgot the password):
//   node scripts/resetPassword.js admin@school.com NewPassword123
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  const [email, newPassword] = process.argv.slice(2);
  if (!email || !newPassword || newPassword.length < 6) {
    console.log('Usage: node scripts/resetPassword.js <email> <new password (min 6 characters)>');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    console.log(`No account with the email ${email}`);
    process.exit(1);
  }
  user.password = newPassword; // hashed automatically on save
  await user.save();
  console.log(`Password changed for ${user.email} (${user.role}).`);
  process.exit(0);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
