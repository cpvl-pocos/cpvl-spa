import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook that triggers a callback after a period of inactivity.
 * @param onIdle Callback to trigger when idle
 * @param timeout Timeout in milliseconds (default 10 minutes)
 */
export const useIdleTimeout = (onIdle: () => void, timeout: number = 10 * 60 * 1000) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(onIdle, timeout);
  }, [onIdle, timeout]);

  useEffect(() => {
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    const handleEvent = () => {
      resetTimeout();
    };

    // Initialize timeout
    resetTimeout();

    // Add listeners
    events.forEach(event => {
      window.addEventListener(event, handleEvent);
    });

    return () => {
      // Cleanup
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleEvent);
      });
    };
  }, [resetTimeout]);
};
