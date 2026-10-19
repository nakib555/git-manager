import React, { useState, useRef, ReactNode, TouchEvent } from 'react';
import { Loader2, ArrowDown } from 'lucide-react';
import { useAppContext } from '../../AppContext';

interface MobilePullToRefreshProps {
  children: ReactNode;
}

export const MobilePullToRefresh: React.FC<MobilePullToRefreshProps> = ({ children }) => {
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
        // ensure bottom padding so content never collides with fixed 56px bottom nav
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
        <div className="w-8 h-8 rounded-full bg-[#1A1A1D] border border-[#2A2A2E] flex items-center justify-center text-[#3B82F6] shadow-md">
          {isRefreshing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ArrowDown
              size={16}
              className="transition-transform duration-200"
              style={{
                transform: `rotate(${pullY >= THRESHOLD ? 180 : 0}deg)`,
              }}
            />
          )}
        </div>
      </div>

      {children}
    </div>
  );
};
