const mongoose = require('mongoose');
const { calculateFine } = require('../utils/fine');

const borrowSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    issueDate: { type: Date, required: true, default: Date.now }, // date + time set by librarian
    dueDate: { type: Date, required: true },
    returnDate: { type: Date }, // submitted date + time set by librarian
    status: { type: String, enum: ['borrowed', 'returned'], default: 'borrowed' },
    fine: { type: Number, default: 0 }, // final fine, set when returned
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    returnedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

borrowSchema.index({ student: 1, status: 1 });
borrowSchema.index({ book: 1, status: 1 });

borrowSchema.virtual('isOverdue').get(function () {
  return this.status === 'borrowed' && this.dueDate < new Date();
});

// Live fine while the book is still out, final fine once returned
borrowSchema.virtual('currentFine').get(function () {
  return this.status === 'returned' ? this.fine : calculateFine(this.dueDate);
});

borrowSchema.set('toJSON', { virtuals: true });
borrowSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Borrow', borrowSchema);
