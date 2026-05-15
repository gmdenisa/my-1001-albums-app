// src/components/ui/GlobalStars.jsx
import React, { useId } from 'react';

const Star = ({ fill }) => {
  const gradientId = useId();

  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
    >
      <defs>
        <linearGradient id={gradientId}>
          <stop offset={`${fill * 100}%`} stopColor="currentColor" />
          <stop offset={`${fill * 100}%`} stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={`url(#${gradientId})`}
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="miter" // Sharp corners
        strokeLinecap="butt"    // Flat ends
      />
    </svg>
  );
};

const GlobalStars = ({ rating = 0 }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5 text-yellow-500">
        {[1, 2, 3, 4, 5].map((i) => {
          // Exact fill logic based on raw rating
          const fill = Math.max(0, Math.min(1, rating - (i - 1)));
          return <Star key={i} fill={fill} />;
        })}
      </div>
      
      <span className="text-[11px] font-bold tracking-tighter text-white/40">
        {rating}
      </span>
    </div>
  );
};

export default GlobalStars;