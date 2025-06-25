
import { useEffect, useCallback } from 'react';
import { PersistedStepData } from '../types/interfaces';

const STORAGE_KEY = 'step2-layout-size-data';
const DATA_VERSION = '1.0';
const EXPIRY_HOURS = 24;

interface UseStepPersistenceProps {
  selectedOrientation: string;
  selectedSize: string;
  onDataRestore?: (data: PersistedStepData) => void;
}

export const useStepPersistence = ({
  selectedOrientation,
  selectedSize,
  onDataRestore
}: UseStepPersistenceProps) => {

  // Save data to localStorage
  const saveData = useCallback(() => {
    if (!selectedOrientation && !selectedSize) return;

    try {
      const data: PersistedStepData = {
        selectedOrientation,
        selectedSize,
        timestamp: Date.now(),
        version: DATA_VERSION
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('💾 Step 2 data saved to localStorage:', data);
    } catch (error) {
      console.warn('⚠️ Failed to save Step 2 data to localStorage:', error);
    }
  }, [selectedOrientation, selectedSize]);

  // Load data from localStorage
  const loadData = useCallback((): PersistedStepData | null => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (!storedData) return null;

      const data: PersistedStepData = JSON.parse(storedData);
      
      // Check data version
      if (data.version !== DATA_VERSION) {
        console.log('🔄 Step 2 data version mismatch, clearing old data');
        clearData();
        return null;
      }

      // Check if data is expired
      const hoursOld = (Date.now() - data.timestamp) / (1000 * 60 * 60);
      if (hoursOld > EXPIRY_HOURS) {
        console.log('⏰ Step 2 data expired, clearing');
        clearData();
        return null;
      }

      console.log('📖 Step 2 data loaded from localStorage:', data);
      return data;
    } catch (error) {
      console.warn('⚠️ Failed to load Step 2 data from localStorage:', error);
      clearData(); // Clear corrupted data
      return null;
    }
  }, []);

  // Clear stored data
  const clearData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('🗑️ Step 2 data cleared from localStorage');
    } catch (error) {
      console.warn('⚠️ Failed to clear Step 2 data from localStorage:', error);
    }
  }, []);

  // Auto-save when data changes
  useEffect(() => {
    if (selectedOrientation || selectedSize) {
      const timeoutId = setTimeout(() => {
        saveData();
      }, 1000); // Debounced save

      return () => clearTimeout(timeoutId);
    }
  }, [selectedOrientation, selectedSize, saveData]);

  // Load data on mount
  useEffect(() => {
    const savedData = loadData();
    if (savedData && onDataRestore) {
      onDataRestore(savedData);
    }
  }, [loadData, onDataRestore]);

  // Clear data on unmount (optional - commented out to persist across page reloads)
  // useEffect(() => {
  //   return () => {
  //     clearData();
  //   };
  // }, [clearData]);

  return {
    saveData,
    loadData,
    clearData
  };
};
