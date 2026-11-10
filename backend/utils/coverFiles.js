const fs = require('fs');
const path = require('path');

// Old covers (uploaded before images moved to the database) may still be files in uploads/covers
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const COVERS_DIR = path.join(UPLOAD_DIR, 'covers');
fs.mkdirSync(COVERS_DIR, { recursive: true });

// Path saved on the book / e-book and used by the browser
const coverPath = (filename) => `/uploads/covers/${filename}`;

// Deletes a stored cover (database copy, and the old disk copy if there is one).
// Only names inside /uploads/covers/ can ever be removed.
const removeCover = async (relPath) => {
  if (!relPath || !relPath.startsWith('/uploads/covers/')) return;
  const name = path.basename(relPath);
  const CoverImage = require('../models/CoverImage'); // loaded here to avoid a circular require
  await CoverImage.deleteOne({ filename: name }).catch(() => {});
  await fs.promises.unlink(path.join(COVERS_DIR, name)).catch(() => {});
};

module.exports = { UPLOAD_DIR, COVERS_DIR, coverPath, removeCover };
