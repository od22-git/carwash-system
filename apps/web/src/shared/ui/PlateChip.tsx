interface PlateChipProps {
  plate: string;
  size?: 'sm' | 'lg';
}

/** Licence plate shown as a yellow plate. The only place plate yellow is used. */
export function PlateChip({ plate, size = 'sm' }: PlateChipProps) {
  const sizing = size === 'lg' ? 'text-2xl px-4 py-1' : 'text-base px-2.5 py-0.5';
  return (
    <span
      dir="ltr"
      className={`inline-block rounded-md border-2 border-ink/70 bg-plate font-display font-bold tracking-wider text-ink whitespace-nowrap ${sizing}`}
    >
      {plate}
    </span>
  );
}
