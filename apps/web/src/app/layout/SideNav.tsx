import type { Role } from '@carwash/shared';
import { NavLink } from 'react-router';
import { isAdminOnly, navFor, type NavItem } from '../navigation';

function NavEntry({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `block rounded-lg px-4 py-2.5 ${
          isActive ? 'bg-foam font-semibold text-white' : 'text-white/80 hover:bg-white/10'
        }`
      }
    >
      {item.label}
    </NavLink>
  );
}

export function SideNav({ role }: { role: Role }) {
  const items = navFor(role);
  const daily = items.filter((i) => !isAdminOnly(i));
  const admin = items.filter(isAdminOnly);

  return (
    <nav aria-label="القائمة" className="flex w-56 shrink-0 flex-col gap-6 bg-ink p-4">
      <p className="px-4 pt-2 font-display text-xl font-bold text-white">المغسلة</p>
      <ul className="flex flex-col gap-1">
        {daily.map((item) => (
          <li key={item.path}>
            <NavEntry item={item} />
          </li>
        ))}
      </ul>
      {admin.length > 0 && (
        <section aria-label="الإدارة" className="flex flex-col gap-1 border-t border-white/15 pt-4">
          <p className="px-4 pb-1 text-sm text-white/50">الإدارة</p>
          {admin.map((item) => (
            <NavEntry key={item.path} item={item} />
          ))}
        </section>
      )}
    </nav>
  );
}
