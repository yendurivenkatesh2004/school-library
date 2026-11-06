// All dates are shown as dd/mm/yyyy, times as hh:mm AM/PM

const pad = (n) => String(n).padStart(2, '0');

export const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (isNaN(d)) return '-';
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

export const formatTime = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (isNaN(d)) return '-';
  const h = d.getHours();
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${pad(hour12)}:${pad(d.getMinutes())} ${h < 12 ? 'AM' : 'PM'}`;
};

export const formatDateTime = (value) => (value ? `${formatDate(value)}, ${formatTime(value)}` : '-');

// "dd/mm/yyyy" text -> Date (local midnight) or null when invalid
export const parseDMY = (text) => {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec((text || '').trim());
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return d;
};

// Date -> { date: 'dd/mm/yyyy', time: 'HH:mm' } used by DateTimeInput
export const partsFromDate = (value = new Date()) => {
  const d = new Date(value);
  return { date: formatDate(d), time: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
};

// { date: 'dd/mm/yyyy', time: 'HH:mm' } -> Date or null when invalid
export const dateFromParts = (date, time) => {
  const base = parseDMY(date);
  const t = /^(\d{1,2}):(\d{2})$/.exec((time || '').trim());
  if (!base || !t) return null;
  const hours = Number(t[1]);
  const minutes = Number(t[2]);
  if (hours > 23 || minutes > 59) return null;
  base.setHours(hours, minutes, 0, 0);
  return base;
};

// Auto-inserts the slashes while typing: 25122026 -> 25/12/2026
export const maskDate = (text) => {
  const digits = (text || '').replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

export const daysLate = (dueDate) => Math.max(0, Math.ceil((Date.now() - new Date(dueDate)) / 86400000));
