import { maskDate, partsFromDate } from '../utils/dateUtils.js';

// Date typed as dd/mm/yyyy (slashes added automatically) + optional time picker + "Now" button
// value = { date: 'dd/mm/yyyy', time: 'HH:mm' }
export default function DateTimeInput({ label, value, onChange, withTime = true }) {
  return (
    <div className="dt-field">
      {label && <label>{label}</label>}
      <div className="dt-row">
        <input
          inputMode="numeric"
          placeholder="dd/mm/yyyy"
          maxLength={10}
          value={value.date}
          onChange={(e) => onChange({ ...value, date: maskDate(e.target.value) })}
        />
        {withTime && (
          <input type="time" value={value.time} onChange={(e) => onChange({ ...value, time: e.target.value })} />
        )}
        <button type="button" className="btn btn-outline btn-sm" onClick={() => onChange(partsFromDate())}>
          {withTime ? 'Now' : 'Today'}
        </button>
      </div>
    </div>
  );
}
