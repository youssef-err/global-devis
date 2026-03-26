/**
 * SSR-safe wrapper for localStorage with error handling and metadata.
 */

export const storage = {
  save: <T>(key: string, data: T) => {
    if (typeof window === "undefined") return;
    try {
      const serializedData = JSON.stringify({
        data,
        timestamp: Date.now(),
      });
      window.localStorage.setItem(key, serializedData);
    } catch (error) {
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        console.error("localStorage quota exceeded. Cannot save data for key:", key);
      } else {
        console.error("Error saving to localStorage for key:", key, error);
      }
    }
  },

  load: <T>(key: string): T | null => {
    if (typeof window === "undefined") return null;
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      // Support returning plain values if they weren't saved with our wrapper
      if (parsed && typeof parsed === 'object' && 'timestamp' in parsed && 'data' in parsed) {
        return (parsed as { data: T }).data;
      }
      return parsed as T;
    } catch (error) {
      console.error("Error loading from localStorage (likely corrupted data) for key:", key, error);
      // Opt to clear corrupted data
      window.localStorage.removeItem(key);
      return null;
    }
  },

  clear: (key?: string) => {
    if (typeof window === "undefined") return;
    try {
      if (key) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.clear();
      }
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },

  getAge: (key: string): number | null => {
    if (typeof window === "undefined") return null;
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      if (parsed && typeof parsed === 'object' && 'timestamp' in parsed) {
        return Date.now() - (parsed as { timestamp: number }).timestamp;
      }
      // If it wasn't saved with our wrapper, we don't know the age
      return null;
    } catch (error) {
      console.error("Error getting age from localStorage for key:", key, error);
      return null;
    }
  }
};
