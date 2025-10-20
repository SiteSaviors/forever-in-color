import type { ReactElement, ReactNode } from 'react';
import ReactQueryBoundary from '@/providers/ReactQueryBoundary';
import AuthProvider from '@/providers/AuthProvider';

type StudioProvidersProps = {
  children: ReactNode;
};

const StudioProviders = ({ children }: StudioProvidersProps): ReactElement => {
  return (
    <ReactQueryBoundary>
      <AuthProvider>{children}</AuthProvider>
    </ReactQueryBoundary>
  );
};

export default StudioProviders;

