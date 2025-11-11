import { lazy, type ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';

const StudioPage = lazy(() => import('@/pages/StudioPage'));
const UsagePage = lazy(() => import('@/pages/UsagePage'));
const StudioRoutes = (): ReactElement => {
  const element = useRoutes([
    { path: '/create/*', element: <StudioPage /> },
    { path: '/studio/usage/*', element: <UsagePage /> },
  ]);

  return element ?? <StudioPage />;
};

export default StudioRoutes;
