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
import { Search, Mic } from 'lucide-react';
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

  const handleVoiceInput = () => {
    // Future: Web Speech API integration
    console.log('[StockSearchField] Voice input not yet implemented');
  };

  return (
    <div className="relative w-full max-w-[600px]">
      {/* Search icon (left) */}
      <div className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-white/40">
        <Search className="h-5 w-5" />
      </div>

      {/* Input field */}
      <input
        type="search"
        value={rawQuery}
        onChange={(e) => setRawQuery(e.target.value)}
        placeholder="What will you create?"
        className="h-14 w-full rounded-full border-2 border-white/10 bg-white/5 pl-14 pr-14 text-center text-lg text-white placeholder:text-white/40 backdrop-blur-sm transition-all focus:border-white/20 focus:bg-white/10 focus:outline-none focus:ring-0"
        style={{
          fontFamily: 'Playfair Display, serif',
        }}
      />

      {/* Microphone icon (right) */}
      <button
        type="button"
        onClick={handleVoiceInput}
        className="absolute right-6 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white focus:outline-none"
        aria-label="Voice search"
      >
        <Mic className="h-5 w-5" />
      </button>
    </div>
  );
};

export default StockSearchField;
