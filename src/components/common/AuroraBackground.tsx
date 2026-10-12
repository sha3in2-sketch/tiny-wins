import React from 'react';

/**
 * Aurora Background:
 * Three heavily blurred, slowly drifting color blobs at low opacity:
 * 1. Deep teal (#1d6b5e)
 * 2. Turmeric (#c9822a)
 * 3. Clay (#8a3b2a)
 */
export const AuroraBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <style>{`
        @keyframes aurora-drift-1 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(6vw, 4vh) scale(1.1); }
        }
        @keyframes aurora-drift-2 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-5vw, -6vh) scale(1.12); }
        }
        @keyframes aurora-drift-3 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(4vw, -5vh) scale(1.08); }
        }
      `}</style>
      {/* Teal blob */}
      <div
        className="absolute rounded-full"
        style={{
          width: '60vmax',
          height: '60vmax',
          backgroundColor: '#1d6b5e',
          opacity: 0.55,
          top: '-25%',
          left: '-15%',
          filter: 'blur(110px)',
          animation: 'aurora-drift-1 30s ease-in-out infinite alternate',
        }}
      />
      {/* Turmeric blob */}
      <div
        className="absolute rounded-full"
        style={{
          width: '45vmax',
          height: '45vmax',
          backgroundColor: '#c9822a',
          opacity: 0.32,
          right: '-12%',
          top: '20%',
          filter: 'blur(110px)',
          animation: 'aurora-drift-2 32s ease-in-out infinite alternate',
          animationDelay: '-10s',
        }}
      />
      {/* Clay blob */}
      <div
        className="absolute rounded-full"
        style={{
          width: '40vmax',
          height: '40vmax',
          backgroundColor: '#8a3b2a',
          opacity: 0.3,
          bottom: '-25%',
          left: '30%',
          filter: 'blur(110px)',
          animation: 'aurora-drift-3 28s ease-in-out infinite alternate',
          animationDelay: '-20s',
        }}
      />
    </div>
  );
};
