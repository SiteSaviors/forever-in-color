import { lazy, type ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';

const StudioPage = lazy(() => import('@/pages/StudioPage'));
const UsagePage = lazy(() => import('@/pages/UsagePage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));

const StudioRoutes = (): ReactElement => {
  const element = useRoutes([
    { path: '/create/*', element: <StudioPage /> },
    { path: '/studio/usage/*', element: <UsagePage /> },
    { path: '/checkout/*', element: <CheckoutPage /> },
  ]);

  return element ?? <StudioPage />;
};

export default StudioRoutes;
