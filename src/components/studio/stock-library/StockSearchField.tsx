/**
 * Stock Search Field
 *
 * Premium pill-shaped search input with voice capability.
 * Matches the reference design exactly: search icon left, microphone right.
 *
 * Features:
 * - 300ms debounced search
 * - Voice input (future)
 * - "What will you create?" placeholder
 * - Premium glassmorphism styling
 */

import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useFounderStore } from '@/store/useFounderStore';
import { useDebounce } from '@/hooks/useDebounce';

const StockSearchField = () => {
  const [rawQuery, setRawQuery] = useState('');
  const debouncedQuery = useDebounce(rawQuery, 300);

  const setSearchQuery = useFounderStore((state) => state.setSearchQuery);

  // Update store with debounced query
  useEffect(() => {
    setSearchQuery(debouncedQuery);
  }, [debouncedQuery, setSearchQuery]);

  return (
    <div className="relative w-full max-w-[2400px]">
      {/* Search icon (left) - surfaced above glassmorphism */}
      <div className="pointer-events-none absolute left-6 top-1/2 z-10 -translate-y-1/2 text-white/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
        <Search className="h-5 w-5" />
      </div>

      {/* Input field */}
      <input
        type="search"
        value={rawQuery}
        onChange={(e) => setRawQuery(e.target.value)}
        placeholder="What will you create?"
        className="h-14 w-full rounded-full border-2 border-white/10 bg-white/5 pl-14 pr-20 text-center text-lg text-white placeholder:text-white/40 backdrop-blur-sm transition-all focus:border-white/20 focus:bg-white/10 focus:outline-none focus:ring-0"
        style={{
          fontFamily: 'Playfair Display, serif',
        }}
      />
    </div>
  );
};

export default StockSearchField;
