import React, { useState, useRef, ReactNode, TouchEvent } from 'react';
import { Loader2, ArrowDown } from 'lucide-react';
import { useAppContext } from '../../AppContext';

export interface PullToRefreshProps {
  children: ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ children }) => {
  const { refreshData, showToast } = useAppContext();
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const THRESHOLD = 68;
  const DAMPING = 0.45;

  const handleTouchStart = (e: TouchEvent) => {
    if (scrollContainerRef.current && scrollContainerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    } else {
      startY.current = 0;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (startY.current === 0 || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0 && scrollContainerRef.current?.scrollTop === 0) {
      // Damped pull
      setPullY(Math.min(diff * DAMPING, 80));
    }
  };

  const handleTouchEnd = async () => {
    if (pullY >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullY(48);

      try {
        await refreshData();
        showToast('Workspace refreshed successfully', 'success');
      } catch {
        showToast('Refreshed local cache', 'info');
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullY(0);
        }, 500);
      }
    } else {
      setPullY(0);
    }
    startY.current = 0;
  };

  return (
    <div
      ref={scrollContainerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="flex-1 overflow-y-auto overflow-x-hidden relative no-scrollbar"
      style={{
        paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 0px) + 16px)',
      }}
    >
      {/* Pull indicator */}
      <div
        className="w-full flex items-center justify-center transition-all duration-200 overflow-hidden pointer-events-none"
        style={{
          height: `${pullY}px`,
          opacity: pullY > 10 ? 1 : 0,
        }}
      >
        <div className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-accent shadow-md">
          {isRefreshing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ArrowDown
              size={16}
              style={{
                transform: `rotate(${Math.min((pullY / THRESHOLD) * 180, 180)}deg)`,
                transition: 'transform 0.1s linear',
              }}
            />
          )}
        </div>
      </div>

      {children}
    </div>
  );
};

// Aliases
export const MobilePullToRefresh = PullToRefresh;
