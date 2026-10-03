import type { Role } from '@carwash/shared';
import { NavLink } from 'react-router';
import { isAdminOnly, navFor, type NavItem } from '../navigation';
import { StockAlert } from './StockAlert';

function NavEntry({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `block rounded-lg px-4 py-2.5 whitespace-nowrap ${
          isActive ? 'bg-foam font-semibold text-white' : 'text-white/80 hover:bg-white/10'
        }`
      }
    >
      {item.label}
      {item.stockAlert && <StockAlert kinds={item.stockAlert} />}
    </NavLink>
  );
}

export function SideNav({ role }: { role: Role }) {
  const items = navFor(role);
  const daily = items.filter((i) => !isAdminOnly(i));
  const admin = items.filter(isAdminOnly);

  return (
    <nav
      aria-label="القائمة"
      className="flex shrink-0 items-center gap-3 overflow-x-auto bg-ink p-3 md:w-56 md:flex-col md:items-stretch md:gap-6 md:overflow-visible md:p-4"
    >
      <p className="px-2 font-display text-xl font-bold whitespace-nowrap text-white md:px-4 md:pt-2">
        المغسلة
      </p>
      <ul className="flex gap-1 md:flex-col">
        {daily.map((item) => (
          <li key={item.path}>
            <NavEntry item={item} />
          </li>
        ))}
      </ul>
      {admin.length > 0 && (
        <section
          aria-label="الإدارة"
          className="flex gap-1 md:flex-col md:border-t md:border-white/15 md:pt-4"
        >
          <p className="hidden px-4 pb-1 text-sm text-white/50 md:block">الإدارة</p>
          {admin.map((item) => (
            <NavEntry key={item.path} item={item} />
          ))}
        </section>
      )}
    </nav>
  );
}
