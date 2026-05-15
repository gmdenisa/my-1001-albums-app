// src/components/forms/StarRatingInput.jsx
import React, { useState } from 'react';

const StarRatingInput = ({ rating, setRating }) => {
  const [hoverRating, setHoverRating] = useState(0);

  // Calculates if the mouse is on the left half or right half of the star element
  const handleMouseMove = (e, index) => {
    const { left, width } = e.target.getBoundingClientRect();
    const percent = (e.clientX - left) / width;
    const newRating = index + (percent < 0.5 ? 0.5 : 1);
    setHoverRating(newRating);
  };

  const currentDisplay = hoverRating > 0 ? hoverRating : rating;

  return (
    <div 
      className="flex items-center cursor-pointer text-2xl select-none"
      onMouseLeave={() => setHoverRating(0)}
    >
      {[0, 1, 2, 3, 4].map((index) => {
        const starValue = index + 1;
        const isFull = currentDisplay >= starValue;
        const isHalf = currentDisplay === starValue - 0.5;

        return (
          <span
            key={index}
            onMouseMove={(e) => handleMouseMove(e, index)}
            onClick={() => setRating(hoverRating)}
            className={`transition-colors duration-100 ${currentDisplay > index ? 'text-yellow-500' : 'text-gray-600'}`}
          >
            {isFull ? '★' : isHalf ? '⯨' : '★'}
          </span>
        );
      })}
      <span className="ml-3 text-sm font-bold text-gray-400 w-8">
        {currentDisplay > 0 ? currentDisplay : '-'}
      </span>
    </div>
  );
};

export default StarRatingInput;