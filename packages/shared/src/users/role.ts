export const ROLES = ['admin', 'user'] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'المسؤول',
  user: 'المستخدم',
};
