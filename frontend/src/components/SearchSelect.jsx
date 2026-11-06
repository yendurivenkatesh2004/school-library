import { useEffect, useRef, useState } from 'react';

// Type to search (name or ID), pick a result from the list.
// fetchOptions(query) must return a Promise of an array of items that have an _id.
export default function SearchSelect({ label, placeholder, fetchOptions, getTitle, getSub, value, onChange }) {
  const [q, setQ] = useState('');
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    setLoading(true);
    const t = setTimeout(() => {
      fetchOptions(q)
        .then(setOptions)
        .catch(() => setOptions([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, open]);

  useEffect(() => {
    const close = (e) => {
      if (box.current && !box.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  if (value) {
    return (
      <div className="ss">
        {label && <label>{label}</label>}
        <div className="ss-selected">
          <div>
            <strong>{getTitle(value)}</strong>
            <small className="muted">{getSub(value)}</small>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              onChange(null);
              setQ('');
            }}
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ss" ref={box}>
      {label && <label>{label}</label>}
      <input
        placeholder={placeholder}
        value={q}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
      />
      {open && (
        <ul className="ss-list">
          {loading && <li className="ss-info">Searching...</li>}
          {!loading && options.length === 0 && <li className="ss-info">No results</li>}
          {!loading &&
            options.map((o) => (
              <li
                key={o._id}
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
              >
                <strong>{getTitle(o)}</strong>
                <small>{getSub(o)}</small>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
