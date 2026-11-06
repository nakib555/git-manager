import React from 'react';
import { useCountUp } from '../../hooks/useCountUp';

export const AnimatedNumber: React.FC<{ value: number; className?: string; formatter?: (v: number) => string }> = ({ value, className, formatter }) => {
  const ref = useCountUp(value, 750, formatter);
  return <span ref={ref as any} className={className}>{formatter ? formatter(value) : value}</span>;
};
