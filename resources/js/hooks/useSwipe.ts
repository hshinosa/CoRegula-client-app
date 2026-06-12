import { useCallback, useRef } from 'react';

interface SwipeHandlers {
    onSwipeRight?: () => void;
    onSwipeLeft?: () => void;
}

export function useSwipe({ onSwipeRight, onSwipeLeft }: SwipeHandlers) {
    const startX = useRef(0);
    const startY = useRef(0);
    const swipeThreshold = 50;

    const onTouchStart = useCallback((e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX;
        startY.current = e.touches[0].clientY;
    }, []);

    const onTouchEnd = useCallback((e: React.TouchEvent) => {
        const deltaX = e.changedTouches[0].clientX - startX.current;
        const deltaY = e.changedTouches[0].clientY - startY.current;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
            if (deltaX > 0 && startX.current < 50) {
                onSwipeRight?.();
            } else if (deltaX < 0) {
                onSwipeLeft?.();
            }
        }
    }, [onSwipeLeft, onSwipeRight]);

    return { onTouchStart, onTouchEnd };
}
