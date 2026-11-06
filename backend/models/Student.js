const mongoose = require('mongoose');

// A student enrolled by the librarian (library record only - students log in with the shared student account)
const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
    },
    name: { type: String, required: [true, 'Student name is required'], trim: true },
    className: { type: String, required: [true, 'Class is required'], trim: true },
    section: { type: String, required: [true, 'Section is required'], trim: true },
    enrollmentDate: { type: Date, default: Date.now },
    parentName: { type: String, required: [true, 'Parent name is required'], trim: true },
    parentPhone: {
      type: String,
      required: [true, 'Parent phone number is required'],
      trim: true,
      match: [/^[0-9+()\-\s]{7,15}$/, 'Enter a valid parent phone number'],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
