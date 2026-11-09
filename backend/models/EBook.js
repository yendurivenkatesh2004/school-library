const mongoose = require('mongoose');

// An electronic book: just a link added by the librarian/admin (e.g. Google Drive, a PDF URL)
const ebookSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'E-book title is required'], trim: true },
    author: { type: String, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    description: { type: String, trim: true, maxlength: [500, 'Description can be at most 500 characters'] },
    link: {
      type: String,
      required: [true, 'E-book link is required'],
      trim: true,
      match: [/^https?:\/\/\S+$/i, 'Link must start with http:// or https://'],
    },
    // Optional cover picture, stored by the server as /uploads/covers/xxx.jpg
    coverImage: { type: String, trim: true },
    // When false students can only read/open the link, no Download button is shown
    allowDownload: { type: Boolean, default: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EBook', ebookSchema);
