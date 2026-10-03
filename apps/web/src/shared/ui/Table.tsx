import type { ReactNode } from 'react';

interface TableProps {
  headers: string[];
  /** Keeps columns readable on a narrow screen (the table scrolls instead). */
  minWidth?: string;
  children: ReactNode;
}

export function Table({ headers, minWidth = '36rem', children }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface">
      <table
        className="w-full border-collapse text-sm [&_td]:whitespace-nowrap"
        style={{ minWidth }}
      >
        <thead>
          <tr className="border-b border-line text-muted">
            {headers.map((h, i) => (
              <th key={`${h}-${i}`} scope="col" className="px-3 py-2.5 text-start font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
