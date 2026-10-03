interface ReceiptRowProps {
  label: string;
  value: string;
  strong?: boolean;
}

export function ReceiptRow({ label, value, strong }: ReceiptRowProps) {
  return (
    <div className={`flex justify-between gap-2 ${strong ? 'text-[13pt] font-bold' : ''}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
