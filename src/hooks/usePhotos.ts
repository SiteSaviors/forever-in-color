
import { useState, useEffect } from 'react';
import { getUserPhotos } from '@/utils/photoOperations';
import { useAuthStore } from '@/hooks/useAuthStore';

export const usePhotos = () => {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const fetchPhotos = async () => {
    if (!user) {
      setPhotos([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const userPhotos = await getUserPhotos();
      setPhotos(userPhotos);
    } catch (err) {
      console.error('Error fetching photos:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch photos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [user]);

  return {
    photos,
    isLoading,
    error,
    refetch: fetchPhotos
  };
};
