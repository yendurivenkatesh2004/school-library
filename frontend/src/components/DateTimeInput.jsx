import { useEffect, useRef, useState } from 'react';
import { fromIsoDate, maskDate, partsFromDate, toIsoDate } from '../utils/dateUtils.js';

// Date typed as dd/mm/yyyy (slashes added automatically) + optional time picker
// value = { date: 'dd/mm/yyyy', time: 'HH:mm' }
//
// live: the date/time follow the clock by themselves (checked every few seconds, so the minute
//       changes on time) until the librarian types or picks something. After that a
//       "Reset to now" button brings the live clock back.
// hideButton: no Now/Today button (used for the due date)
// calendar: show a 📅 button that opens the browser's date picker (only where it is wanted)
export default function DateTimeInput({ label, value, onChange, withTime = true, live = false, hideButton = false, calendar: withCalendar = false }) {
  const [edited, setEdited] = useState(false);
  const calendarInput = useRef(null);
  const latest = useRef({ value, onChange });
  latest.current = { value, onChange };

  useEffect(() => {
    if (!live || edited) return undefined;
    const tick = () => {
      const now = partsFromDate();
      const cur = latest.current.value;
      if (now.date !== cur.date || now.time !== cur.time) latest.current.onChange(now);
    };
    tick();
    const timer = setInterval(tick, 5000);
    return () => clearInterval(timer);
  }, [live, edited]);

  const change = (next) => {
    if (live) setEdited(true);
    onChange(next);
  };

  // Calendar: the browser's own date picker (hidden input), result copied back as dd/mm/yyyy
  const openCalendar = () => {
    const el = calendarInput.current;
    if (!el) return;
    try {
      el.showPicker();
    } catch {
      el.focus();
      el.click(); // older browsers
    }
  };
  const pickFromCalendar = (e) => {
    const text = fromIsoDate(e.target.value);
    if (text) change({ ...value, date: text });
  };

  const resetToNow = () => {
    setEdited(false);
    onChange(partsFromDate());
  };

  return (
    <div className="dt-field">
      {label && <label>{label}</label>}
      <div className="dt-row">
        <div className="dt-date">
          <input
            inputMode="numeric"
            placeholder="dd/mm/yyyy"
            maxLength={10}
            value={value.date}
            onChange={(e) => change({ ...value, date: maskDate(e.target.value) })}
          />
          {withCalendar && (
            <>
              <button
                type="button"
                className="btn btn-outline btn-icon"
                aria-label="Choose date from calendar"
                title="Choose date from calendar"
                onClick={openCalendar}
              >
                📅
              </button>
              <input
                ref={calendarInput}
                type="date"
                className="dt-native"
                tabIndex={-1}
                aria-hidden="true"
                value={toIsoDate(value.date)}
                onChange={pickFromCalendar}
              />
            </>
          )}
        </div>
        {withTime && (
          <input type="time" value={value.time} onChange={(e) => change({ ...value, time: e.target.value })} />
        )}
        {live ? (
          edited && (
            <button type="button" className="btn btn-outline btn-sm" onClick={resetToNow}>
              Reset to now
            </button>
          )
        ) : (
          !hideButton && (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => onChange(partsFromDate())}>
              {withTime ? 'Now' : 'Today'}
            </button>
          )
        )}
      </div>
      {live && !edited && <small className="muted">Updates automatically with the clock</small>}
    </div>
  );
}
