import { RouterProvider } from 'react-router';
import { PrintSlot } from '../core/print';
import { router } from './router';

export function App() {
  return (
    <>
      <RouterProvider router={router} />
      <PrintSlot />
    </>
  );
}
