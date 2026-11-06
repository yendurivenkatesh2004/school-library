const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const COVERS_DIR = path.join(UPLOAD_DIR, 'covers');
fs.mkdirSync(COVERS_DIR, { recursive: true });

// Path saved in the database and used in the browser
const coverPath = (filename) => `/uploads/covers/${filename}`;

// Deletes a stored cover file. Only files inside uploads/covers can ever be removed.
const removeCover = (relPath) => {
  if (!relPath || !relPath.startsWith('/uploads/covers/')) return Promise.resolve();
  return fs.promises.unlink(path.join(COVERS_DIR, path.basename(relPath))).catch(() => {});
};

module.exports = { UPLOAD_DIR, COVERS_DIR, coverPath, removeCover };
