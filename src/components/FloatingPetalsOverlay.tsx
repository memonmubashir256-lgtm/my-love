import React, { useMemo } from 'react';

interface FloatingPetalsOverlayProps {
  count?: number;
  burstMode?: boolean;
}

export const FloatingPetalsOverlay: React.FC<FloatingPetalsOverlayProps> = ({
  count = 14,
  burstMode = false,
}) => {
  const petals = useMemo(() => {
    const actualCount = burstMode ? Math.max(count, 42) : count;
    return Array.from({ length: actualCount }, (_, i) => {
      const left = ((i * 73 + 11) % 96) + 2;
      const duration = burstMode ? 4.5 + (i % 5) * 0.8 : 9.5 + (i % 6) * 1.8;
      const delay = burstMode ? (i % 10) * 0.25 : -((i * 1.7) % 12);
      const size = 10 + (i % 4) * 4;
      const drift = ((i % 2 === 0 ? 1 : -1) * (35 + (i % 4) * 18));
      const spin = (i % 2 === 0 ? 1 : -1) * (240 + (i % 5) * 45);
      const tone =
        i % 3 === 0 ? '#A31336' : i % 3 === 1 ? '#C8224A' : '#F4A6B8';
      return { id: i, left, duration, delay, size, drift, spin, tone };
    });
  }, [count, burstMode]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      {petals.map((p) => (
        <span
          key={p.id}
          className="animate-petal-fall absolute -top-8 block"
          style={
            {
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${Math.round(p.size * 1.3)}px`,
              backgroundColor: p.tone,
              borderRadius: '75% 15% 75% 15%',
              opacity: 0.72,
              '--petal-duration': `${p.duration}s`,
              '--petal-delay': `${p.delay}s`,
              '--petal-drift': `${p.drift}px`,
              '--petal-spin': `${p.spin}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};
