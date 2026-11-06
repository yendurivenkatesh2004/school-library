const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Book name is required'], trim: true },
    bookId: { type: String, required: [true, 'Book ID is required'], unique: true, trim: true },
    author: { type: String, required: [true, 'Author is required'], trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    shelfLocation: { type: String, required: [true, 'Shelf is required'], trim: true },
    coverImage: { type: String, trim: true }, // e.g. /uploads/covers/<random>.jpg
    totalCopies: { type: Number, required: true, min: [1, 'At least 1 copy is required'], default: 1 },
    availableCopies: { type: Number, min: 0, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);
