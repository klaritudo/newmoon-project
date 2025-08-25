import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Custom hook for auto-refresh functionality
 * @param {Function} callback - Function to call on each refresh
 * @param {number} interval - Refresh interval in milliseconds (0 to disable)
 * @param {boolean} enabled - Whether auto-refresh is enabled
 * @returns {Object} - { remainingTime, resetTimer, isRefreshing }
 */
const useAutoRefresh = (callback, interval = 30000, enabled = false) => {
  const [remainingTime, setRemainingTime] = useState(interval / 1000);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);
  const lastRefreshRef = useRef(Date.now());

  // Reset timer when manually refreshed
  const resetTimer = useCallback(() => {
    lastRefreshRef.current = Date.now();
    setRemainingTime(interval / 1000);
  }, [interval]);

  // Main refresh effect
  useEffect(() => {
    // Clear existing intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    // Only set up intervals if enabled and interval > 0
    if (!enabled || !interval || interval <= 0) {
      setRemainingTime(0);
      return;
    }

    // Initial remaining time
    setRemainingTime(Math.ceil(interval / 1000));

    // Set up countdown timer (updates every second)
    countdownRef.current = setInterval(() => {
      const elapsed = Date.now() - lastRefreshRef.current;
      const remaining = Math.max(0, Math.ceil((interval - elapsed) / 1000));
      setRemainingTime(remaining);
    }, 1000);

    // Set up refresh interval
    intervalRef.current = setInterval(async () => {
      // Check if document is visible (tab is active)
      if (document.hidden) {
        return;
      }

      setIsRefreshing(true);
      try {
        await callback();
        lastRefreshRef.current = Date.now();
        setRemainingTime(Math.ceil(interval / 1000));
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Auto-refresh error:', error);
        }
      } finally {
        setIsRefreshing(false);
      }
    }, interval);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [callback, interval, enabled]);

  // Handle visibility change (pause when tab is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && enabled && interval > 0) {
        // Tab became visible - reset the timer
        const elapsed = Date.now() - lastRefreshRef.current;
        if (elapsed >= interval) {
          // If enough time has passed, refresh immediately
          callback();
          lastRefreshRef.current = Date.now();
          setRemainingTime(Math.ceil(interval / 1000));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [callback, interval, enabled]);

  return {
    remainingTime,
    resetTimer,
    isRefreshing
  };
};

export default useAutoRefresh;