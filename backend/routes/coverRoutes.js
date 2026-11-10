const express = require('express');
const CoverImage = require('../models/CoverImage');

const router = express.Router();

// GET /uploads/covers/<32 hex>.<jpg|png|webp>  - public picture, read from MongoDB.
// Old files that still exist on disk are served earlier by express.static; this handles the rest.
router.get('/covers/:name', async (req, res, next) => {
  if (!/^[0-9a-f]{32}\.(jpg|png|webp)$/.test(req.params.name)) return next();
  try {
    const img = await CoverImage.findOne({ filename: req.params.name }); // not .lean(): Mongoose then gives a plain Buffer
    if (!img) return next();
    const body = Buffer.from(img.data);
    res.set({
      'Content-Type': img.contentType,
      'Content-Length': body.length,
      'X-Content-Type-Options': 'nosniff',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      // the name is random and never reused, so browsers may keep it for a long time
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    res.send(body);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
