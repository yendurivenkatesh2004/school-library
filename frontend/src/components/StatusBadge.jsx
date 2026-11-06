// Shows borrowed / overdue / returned status for a borrow record
export default function StatusBadge({ borrow }) {
  if (borrow.status === 'returned') return <span className="badge badge-gray">Returned</span>;
  if (borrow.isOverdue) return <span className="badge badge-red">Overdue</span>;
  return <span className="badge badge-blue">Borrowed</span>;
}
