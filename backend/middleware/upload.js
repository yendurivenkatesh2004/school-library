const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const { COVERS_DIR } = require('../utils/coverFiles');

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

const storage = multer.diskStorage({
  destination: COVERS_DIR,
  // Random name + extension chosen by us (never the name the user sent)
  filename: (req, file, cb) => cb(null, crypto.randomBytes(16).toString('hex') + EXT[file.mimetype]),
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!EXT[file.mimetype]) return cb(new Error('Cover must be a JPG, PNG or WEBP image'));
    cb(null, true);
  },
}).single('cover');

// The browser-reported type can be faked, so also check the real file signature
const looksLikeImage = (file) => {
  const buf = Buffer.alloc(12);
  const fd = fs.openSync(file.path, 'r');
  try {
    fs.readSync(fd, buf, 0, 12, 0);
  } finally {
    fs.closeSync(fd);
  }
  const jpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const png = buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const webp = buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP';
  return jpeg || png || webp;
};

// Use after the auth middleware so unauthorised people can never write a file
module.exports = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(400);
      return next(
        err.code === 'LIMIT_FILE_SIZE' ? new Error('Cover image is too large (maximum 2 MB)') : err
      );
    }
    if (req.file && !looksLikeImage(req.file)) {
      fs.unlink(req.file.path, () => {});
      res.status(400);
      return next(new Error('That file is not a valid JPG, PNG or WEBP image'));
    }
    next();
  });
};
