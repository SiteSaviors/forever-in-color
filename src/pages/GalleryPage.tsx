import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Heart, Trash2, ArrowLeft, Filter, Sparkles } from 'lucide-react';
import { useFounderStore } from '@/store/useFounderStore';
import {
  fetchGalleryItems,
  deleteGalleryItem,
  toggleGalleryFavorite,
  incrementGalleryDownload,
  getGalleryDownloadUrl,
  type GalleryItem,
  type GalleryFilters,
} from '@/utils/galleryApi';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

const GalleryPage = () => {
  const navigate = useNavigate();
  const sessionAccessToken = useFounderStore((state) => state.sessionAccessToken);
  const entitlements = useFounderStore((state) => state.entitlements);
  const anonToken = useFounderStore((state) => state.anonToken);

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<GalleryFilters>({
    sort: 'newest',
    limit: 50,
    offset: 0,
  });

  const [showFilters, setShowFilters] = useState(false);

  // Check if user has access to clean (watermark-free) downloads
  const requiresWatermark = entitlements.requiresWatermark;

  // Fetch gallery items
  const loadGallery = useCallback(async () => {
    setLoading(true);
    setError(null);

    const accessToken = sessionAccessToken || null;
    const result = await fetchGalleryItems(filters, anonToken, accessToken);

    if ('error' in result) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setItems(result.items);
    setTotal(result.total);
    setLoading(false);
  }, [anonToken, filters, sessionAccessToken]);

  useEffect(() => {
    void loadGallery();
  }, [loadGallery]);

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this from your gallery?')) {
      return;
    }

    const accessToken = sessionAccessToken || null;
    const result = await deleteGalleryItem(itemId, anonToken, accessToken);

    if (result.success) {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      setTotal((prev) => prev - 1);
    } else {
      alert(`Failed to delete: ${result.error}`);
    }
  };

  const handleToggleFavorite = async (item: GalleryItem) => {
    const accessToken = sessionAccessToken || null;
    const newFavoriteState = !item.isFavorited;

    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isFavorited: newFavoriteState } : i))
    );

    const result = await toggleGalleryFavorite(item.id, newFavoriteState, anonToken, accessToken);

    if (!result.success) {
      // Revert on error
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isFavorited: !newFavoriteState } : i))
      );
      alert(`Failed to update favorite: ${result.error}`);
    }
  };

  const handleDownload = async (item: GalleryItem) => {
    if (requiresWatermark) {
      alert('Upgrade to unlock clean, watermark-free downloads.');
    }

    // Track download
    const accessToken = sessionAccessToken || null;
    await incrementGalleryDownload(item.id, anonToken, accessToken);

    let downloadUrl: string;
    try {
      downloadUrl = await getGalleryDownloadUrl(item, requiresWatermark, anonToken, accessToken);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to prepare download.';
      alert(message);
      return;
    }

    // Trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `wondertone-${item.styleName}-${item.orientation}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Update local state
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? { ...i, downloadCount: i.downloadCount + 1, lastDownloadedAt: new Date().toISOString() }
          : i
      )
    );
  };

  const handleReorder = (_item: GalleryItem) => {
    // TODO: Pre-fill studio configurator with this preview's settings
    // For now, just navigate to create
    navigate('/create');
  };

  const orientationLabels: Record<string, string> = {
    horizontal: 'Landscape',
    vertical: 'Portrait',
    square: 'Square',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/create')}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Studio</span>
            </button>
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-brand-indigo" />
              <h1 className="text-xl font-semibold text-white">My Gallery</h1>
            </div>
            <Badge variant="glass">{total} saved</Badge>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-white/10 bg-slate-900/50 backdrop-blur-sm overflow-hidden"
          >
            <div className="max-w-[1800px] mx-auto px-6 py-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-white/60">Sort:</label>
                  <select
                    value={filters.sort || 'newest'}
                    onChange={(e) => setFilters({ ...filters, sort: e.target.value as 'newest' | 'oldest' | 'downloads', offset: 0 })}
                    className="px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="downloads">Most Downloaded</option>
                  </select>
                </div>

                {/* Orientation */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-white/60">Orientation:</label>
                  <select
                    value={filters.orientation || 'all'}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        orientation: e.target.value === 'all' ? undefined : (e.target.value as 'horizontal' | 'vertical' | 'square'),
                        offset: 0,
                      })
                    }
                    className="px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                  >
                    <option value="all">All</option>
                    <option value="horizontal">Landscape</option>
                    <option value="vertical">Portrait</option>
                    <option value="square">Square</option>
                  </select>
                </div>

                {/* Favorites Only */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.favorites || false}
                    onChange={(e) => setFilters({ ...filters, favorites: e.target.checked, offset: 0 })}
                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-brand-indigo focus:ring-brand-indigo"
                  />
                  <span className="text-sm text-white/80">Favorites Only</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-brand-indigo/30 border-t-brand-indigo rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/60">Loading your gallery...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <p className="text-red-300">{error}</p>
            <Button onClick={() => loadGallery()} variant="primary" className="mt-4">
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">No saved previews yet</h2>
            <p className="text-white/60 mb-6">
              Start creating AI art and save your favorites to your gallery
            </p>
            <Button onClick={() => navigate('/create')} variant="primary">
              Create Art
            </Button>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-brand-indigo/50 transition-all"
              >
                {/* Preview Image */}
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={item.displayUrl}
                    alt={item.styleName}
                    className="w-full h-full object-cover"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                      <button
                        onClick={() => handleDownload(item)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleFavorite(item)}
                        className={`p-2 rounded-lg transition-colors ${
                          item.isFavorited
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                        title={item.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart className={`w-4 h-4 ${item.isFavorited ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-red-500/20 text-white hover:text-red-300 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Favorite Badge */}
                  {item.isFavorited && (
                    <div className="absolute top-3 right-3">
                      <Heart className="w-5 h-5 text-red-400 fill-current drop-shadow-lg" />
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="p-4">
                  <h3 className="font-medium text-white mb-2 truncate">{item.styleName}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="brand">{orientationLabels[item.orientation]}</Badge>
                    {item.downloadCount > 0 && (
                      <Badge variant="emerald">{item.downloadCount} downloads</Badge>
                    )}
                  </div>
                  <button
                    onClick={() => handleReorder(item)}
                    className="mt-3 w-full px-4 py-2 rounded-lg bg-brand-indigo/10 hover:bg-brand-indigo/20 text-brand-indigo font-medium transition-colors text-sm"
                  >
                    Re-order Canvas
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;
