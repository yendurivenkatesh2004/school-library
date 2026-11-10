const mongoose = require('mongoose');

// Uploaded cover pictures (books and e-books) are kept in MongoDB, not on the server's disk.
// Hosting disks such as Render's free plan are wiped on every restart/redeploy, the database is not.
const coverImageSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true, unique: true }, // random name, e.g. 3f2a...c1.jpg
    contentType: { type: String, required: true },
    data: { type: Buffer, required: true },
    size: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CoverImage', coverImageSchema);
