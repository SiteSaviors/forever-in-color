
import { useState, useEffect } from 'react';
import { getUserPreviews } from '@/utils/previewOperations';
import { useAuthStore } from '@/hooks/useAuthStore';

export const usePreviews = (photoId?: string) => {
  const [previews, setPreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const fetchPreviews = async () => {
    if (!user) {
      setPreviews([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const userPreviews = await getUserPreviews(photoId);
      setPreviews(userPreviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch previews');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPreviews();
  }, [user, photoId]);

  return {
    previews,
    isLoading,
    error,
    refetch: fetchPreviews
  };
};
