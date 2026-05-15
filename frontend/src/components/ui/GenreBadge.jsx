// src/components/ui/GenreBadge.jsx
import React from 'react';

const GenreBadge = ({ year, genre }) => {
  return (
    <span className="absolute top-4 left-4 bg-black/40 text-xs px-3 py-1.5 rounded-md text-white font-bold tracking-wider backdrop-blur-sm shadow-sm">
      {year} • {genre}
    </span>
  );
};

export default GenreBadge;