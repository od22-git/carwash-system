/** Next to an amount taken on the customer's account. */
export function PaidLaterTag({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="ms-2 rounded-md bg-status-grace/15 px-1.5 py-0.5 text-xs font-semibold text-status-grace">
      آجل
    </span>
  );
}
