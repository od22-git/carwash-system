import type { ParkingSessionRecord } from '@carwash/shared';
import { ParkedCard } from './ParkedCard';

/** The garage board: every parked car, the longest-staying first. */
export function ParkedCars({ parked, now }: { parked: ParkingSessionRecord[]; now: number }) {
  return (
    <section aria-label="في الكراج الآن" className="flex flex-col gap-3">
      <h2 className="flex items-baseline gap-2 font-display text-lg font-bold">
        في الكراج الآن
        <span className="font-body text-base font-normal text-muted">({parked.length})</span>
      </h2>
      {parked.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-6 text-muted">
          لا توجد سيارات في الكراج.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {parked.map((s) => (
            <ParkedCard key={s.id} session={s} now={now} />
          ))}
        </div>
      )}
    </section>
  );
}
