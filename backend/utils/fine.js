const DAY = 1000 * 60 * 60 * 24;

// Fine = overdue days x FINE_PER_DAY
exports.calculateFine = (dueDate, returnDate = new Date()) => {
  const perDay = Number(process.env.FINE_PER_DAY) || 2;
  const overdueDays = Math.ceil((new Date(returnDate) - new Date(dueDate)) / DAY);
  return overdueDays > 0 ? overdueDays * perDay : 0;
};

exports.addDays = (date, days) => new Date(new Date(date).getTime() + days * DAY);

exports.escapeRegex = (str = '') => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
