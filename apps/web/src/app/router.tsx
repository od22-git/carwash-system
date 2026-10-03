import { createBrowserRouter, Navigate } from 'react-router';
import { AppShell } from './layout/AppShell';
import { NAV_ITEMS } from './navigation';
import { PlaceholderPage } from './PlaceholderPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/wash" replace /> },
      ...NAV_ITEMS.map((item) => ({
        path: item.path,
        element: <PlaceholderPage title={item.label} />,
      })),
    ],
  },
]);
