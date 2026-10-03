import type { ReactNode } from 'react';

/** Navy side with the shop name, form on the light side. Used by login and first-run setup. */
export function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid min-h-dvh md:grid-cols-[1fr_minmax(0,28rem)]">
      <aside className="hidden flex-col justify-end bg-ink p-12 md:flex">
        <img src="/favicon.svg" alt="" className="mb-6 size-14" />
        <p className="font-display text-3xl font-bold text-white">إدارة المغسلة</p>
        <p className="mt-2 max-w-sm text-white/70">
          الغسيل والكراج والمخزون والعمال في مكان واحد، ويعمل حتى بدون إنترنت.
        </p>
      </aside>
      <main className="flex flex-col justify-center gap-6 bg-surface px-8 py-12">
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        {children}
      </main>
    </div>
  );
}
