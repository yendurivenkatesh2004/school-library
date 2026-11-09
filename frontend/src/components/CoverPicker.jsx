import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { COVER_TYPES, MAX_COVER_MB, imageUrl } from '../utils/images.js';

// Image chooser with a preview.
//   currentCover: path of the image already saved (when editing)
//   onChange({ file, remove }): file = newly chosen File or null, remove = "delete the saved image"
export default function CoverPicker({ label = 'Cover image', currentCover = '', onChange }) {
  const input = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [remove, setRemove] = useState(false);

  // Free the temporary preview URL
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const report = (nextFile, nextRemove) => onChange({ file: nextFile, remove: nextRemove });

  const pick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!COVER_TYPES.includes(f.type)) {
      toast.error('Please choose a JPG, PNG or WEBP image');
      e.target.value = '';
      return;
    }
    if (f.size > MAX_COVER_MB * 1024 * 1024) {
      toast.error(`Image is too large. Maximum size is ${MAX_COVER_MB} MB`);
      e.target.value = '';
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setRemove(false);
    report(f, false);
  };

  const clear = () => {
    setFile(null);
    setPreview('');
    if (input.current) input.current.value = '';
    report(null, remove);
  };

  const toggleRemove = (checked) => {
    setRemove(checked);
    report(file, checked);
  };

  const shown = preview || (!remove && currentCover ? imageUrl(currentCover) : '');

  return (
    <div>
      <label>{label}</label>
      <div className="cover-picker">
        <div className="cover-preview">
          {shown ? <img src={shown} alt="Cover preview" /> : <span className="muted">No image</span>}
        </div>
        <div className="cover-controls">
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} />
          <small className="muted">JPG, PNG or WEBP, up to {MAX_COVER_MB} MB. Optional.</small>
          {file && (
            <button type="button" className="btn btn-outline btn-sm" onClick={clear}>
              Clear chosen image
            </button>
          )}
          {currentCover && !file && (
            <label className="check">
              <input type="checkbox" checked={remove} onChange={(e) => toggleRemove(e.target.checked)} />
              Remove the current image
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
