import { useEffect } from 'react';

// On phones the tables turn into cards. Each cell then needs its column title, so this copies the
// header text of every table into a data-label attribute (CSS shows it with ::before).
export default function useTableLabels() {
  useEffect(() => {
    const label = () => {
      document.querySelectorAll('.table-wrap table').forEach((table) => {
        const heads = [...table.querySelectorAll('thead th')].map((th) => th.textContent.trim());
        table.querySelectorAll('tbody tr').forEach((tr) => {
          [...tr.children].forEach((td, i) => {
            if (td.tagName !== 'TD' || td.hasAttribute('colspan')) return;
            const text = heads[i] || '';
            if (td.dataset.label !== text) td.dataset.label = text;
          });
        });
      });
    };

    let frame;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(label);
    };

    label();
    const observer = new MutationObserver(schedule); // watches added/removed rows only, not attribute changes
    observer.observe(document.getElementById('root'), { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);
}
