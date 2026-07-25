import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { useAppContext } from '../AppContext';

interface PullToRefreshProps {
  children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ children }) => {
  const { refreshData } = useAppContext();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const startY = useRef<number | null>(null);
  const currentY = useRef<number | null>(null);
  const isPulling = useRef<boolean>(false);
  const threshold = 70; // px
  const maxPull = 120; // px

  const handleStart = (y: number, target: EventTarget) => {
    if (isRefreshing) return;
    const container = containerRef.current;
    
    let node = target as HTMLElement | null;
    let isNestedScrolling = false;
    while (node && node !== container) {
      if (node.scrollHeight > node.clientHeight && node.scrollTop > 0) {
        isNestedScrolling = true;
        break;
      }
      node = node.parentElement;
    }

    if (container && container.scrollTop === 0 && !isNestedScrolling) {
      startY.current = y;
      isPulling.current = true;
    }
  };

  const handleMove = (y: number) => {
    if (startY.current === null || isRefreshing || !isPulling.current) return;
    currentY.current = y;
    const diff = currentY.current - startY.current;
    
    if (diff > 0) {
      // Resistance factor for heavy weighted feel
      const resistance = 0.5;
      const pull = Math.min(diff * resistance, maxPull);
      setPullDistance(pull);
    }
  };

  const handleEnd = async () => {
    if (startY.current === null) return;
    startY.current = null;
    currentY.current = null;
    isPulling.current = false;

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold); // Hold at threshold level during action
      try {
        await refreshData();
      } catch (e) {
        console.error(e);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientY, e.target);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current !== null) {
      handleMove(e.touches[0].clientY);
      const container = containerRef.current;
      if (container && container.scrollTop === 0 && e.touches[0].clientY > startY.current) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    }
  };

  const onTouchEnd = () => {
    handleEnd();
  };

  // Mouse handlers for desktop cursor usage
  const onMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientY, e.target);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientY);
  };

  const onMouseUp = () => {
    handleEnd();
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (startY.current !== null) {
        handleEnd();
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [pullDistance, isRefreshing]);

  return (
    <div 
      id="mobile-scroll-container"
      ref={containerRef}
      className="flex-1 overflow-y-auto overflow-x-hidden px-5 pb-5 no-scrollbar relative select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      style={{
        touchAction: startY.current !== null ? 'none' : 'auto'
      }}
    >
      {/* Pull down visual indicator */}
      <div 
        className="absolute top-3 left-0 right-0 flex justify-center pointer-events-none z-40 transition-all duration-75"
        style={{
          transform: `translateY(${Math.max(0, pullDistance - 40)}px)`,
          opacity: pullDistance > 10 ? Math.min(pullDistance / threshold, 1) : 0
        }}
      >
        <div className="bg-card border border-border shadow-lg rounded-full px-4 py-2.5 flex items-center gap-2 text-[11px] font-semibold text-text-main">
          <motion.div
            animate={isRefreshing ? { rotate: 360 } : { rotate: (pullDistance / threshold) * 360 }}
            transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : { type: "tween" }}
          >
            <RefreshCw size={12} className="text-primary" />
          </motion.div>
          <span>
            {isRefreshing 
              ? 'Refreshing...' 
              : pullDistance >= threshold 
                ? 'Release to refresh' 
                : 'Pull to refresh'}
          </span>
        </div>
      </div>

      {/* Slide down page contents */}
      <motion.div
        animate={{ y: pullDistance }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="h-full"
      >
        {children}
      </motion.div>
    </div>
  );
};
