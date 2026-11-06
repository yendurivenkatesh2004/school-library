const Student = require('../models/Student');
const Borrow = require('../models/Borrow');
const Reservation = require('../models/Reservation');
const asyncHandler = require('../utils/asyncHandler');
const { escapeRegex } = require('../utils/fine');

const FIELDS = [
  'studentId',
  'name',
  'className',
  'section',
  'enrollmentDate',
  'parentName',
  'parentPhone',
  'isActive',
];
const pick = (body) =>
  FIELDS.reduce((obj, key) => (body[key] !== undefined ? { ...obj, [key]: body[key] } : obj), {});

// GET /api/students?search=&className=&section=&active=true&page=1&limit=20
exports.getStudents = asyncHandler(async (req, res) => {
  const { search, className, section, active, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: rx }, { studentId: rx }, { parentName: rx }];
  }
  if (className) filter.className = new RegExp(`^${escapeRegex(className)}$`, 'i');
  if (section) filter.section = new RegExp(`^${escapeRegex(section)}$`, 'i');
  if (active === 'true') filter.isActive = true;

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 500);

  const [students, total] = await Promise.all([
    Student.find(filter)
      .sort('name')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Student.countDocuments(filter),
  ]);

  res.json({ students, page: pageNum, pages: Math.ceil(total / limitNum), total });
});

// POST /api/students   (enroll a new student)
exports.createStudent = asyncHandler(async (req, res) => {
  const student = await Student.create(pick(req.body));
  res.status(201).json(student);
});

// PUT /api/students/:id
exports.updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  Object.assign(student, pick(req.body));
  await student.save();
  res.json(student);
});

// DELETE /api/students/:id
exports.deleteStudent = asyncHandler(async (req, res) => {
  if (await Borrow.exists({ student: req.params.id, status: 'borrowed' })) {
    res.status(400);
    throw new Error('This student still has books to return. Deactivate instead, or return the books first.');
  }
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  await Reservation.updateMany({ student: req.params.id, status: 'active' }, { status: 'cancelled' });
  res.json({ message: 'Student deleted' });
});
