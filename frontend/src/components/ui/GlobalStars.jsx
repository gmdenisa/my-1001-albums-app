// src/components/ui/GlobalStars.jsx
import React, { useId } from 'react';

const Star = ({ fill }) => {
  const gradientId = useId();

  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      // ✅ Increased from w-4 h-4 to w-5 h-5 (or w-6 h-6 if you want them massive)
      className="w-5 h-5"
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
      {/* ✅ Removed 'text-yellow-500' so it naturally inherits the creamy white from the Title Card */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => {
          // Exact fill logic based on raw rating
          const fill = Math.max(0, Math.min(1, rating - (i - 1)));
          return <Star key={i} fill={fill} />;
        })}
      </div>
      
      {/* ✅ Slightly bumped text size and opacity to match the bigger stars */}
      <span className="text-[12px] font-bold tracking-tighter opacity-80">
        {rating}
      </span>
    </div>
  );
};

export default GlobalStars;