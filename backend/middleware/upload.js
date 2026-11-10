const crypto = require('crypto');
const multer = require('multer');
const CoverImage = require('../models/CoverImage');

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

// The picture is held in memory just long enough to check it, then saved in MongoDB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!EXT[file.mimetype]) return cb(new Error('Image must be a JPG, PNG or WEBP image'));
    cb(null, true);
  },
}).single('cover');

// The browser-reported type can be faked, so also check the real file signature.
// Returns the true content type, or null when it is not one of the allowed images.
const detectType = (buf) => {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length >= 8 && buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.length >= 12 && buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return 'image/webp';
  return null;
};

// Use after the auth middleware so unauthorised people can never store anything.
// On success req.file.filename is set (same as before), so the controllers need no change.
module.exports = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      res.status(400);
      return next(
        err.code === 'LIMIT_FILE_SIZE' ? new Error('Image is too large (maximum 2 MB)') : err
      );
    }
    if (!req.file) return next();

    const type = detectType(req.file.buffer);
    if (!type) {
      res.status(400);
      return next(new Error('That file is not a valid JPG, PNG or WEBP image'));
    }
    try {
      // Random name + extension chosen by us (never the name the user sent)
      const filename = crypto.randomBytes(16).toString('hex') + EXT[type];
      await CoverImage.create({ filename, contentType: type, data: req.file.buffer, size: req.file.size });
      req.file.filename = filename;
      req.file.buffer = undefined; // free the memory
      next();
    } catch (e) {
      next(e);
    }
  });
};
