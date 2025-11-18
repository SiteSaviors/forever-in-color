import { useEffect } from 'react';

export const useGalleryExternalRefresh = (refresh: () => void) => {
  useEffect(() => {
    const handleExternalRefresh = () => {
      refresh();
    };
    window.addEventListener('gallery-quickview-refresh', handleExternalRefresh);
    return () => window.removeEventListener('gallery-quickview-refresh', handleExternalRefresh);
  }, [refresh]);
};

export default useGalleryExternalRefresh;
