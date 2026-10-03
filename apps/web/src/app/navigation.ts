import type { Role } from '@carwash/shared';

export interface NavItem {
  path: string;
  label: string;
  /** Who sees this screen. The user (cashier) only records washes, garage and sales. */
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/wash', label: 'الغسيل', roles: ['user', 'admin'] },
  { path: '/garage', label: 'الكراج', roles: ['user', 'admin'] },
  { path: '/sales', label: 'البيع والبوفيه', roles: ['user', 'admin'] },
  { path: '/customers', label: 'العملاء', roles: ['user', 'admin'] },
  { path: '/stock', label: 'المخزون', roles: ['admin'] },
  { path: '/waste', label: 'مواد الهدر', roles: ['admin'] },
  { path: '/workers', label: 'العمال', roles: ['admin'] },
  { path: '/services', label: 'الخدمات والأسعار', roles: ['admin'] },
  { path: '/packages', label: 'الباقات وخطط الكراج', roles: ['admin'] },
  { path: '/finance', label: 'الحسابات والتقارير', roles: ['admin'] },
  { path: '/settings', label: 'الإعدادات', roles: ['admin'] },
];

export const navFor = (role: Role) => NAV_ITEMS.filter((item) => item.roles.includes(role));

export const isAdminOnly = (item: NavItem) => !item.roles.includes('user');
