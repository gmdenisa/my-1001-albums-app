// src/hooks/useDraftStorage.js
import { useState, useEffect } from 'react';

export const useDraftStorage = (albumId) => {
  const storageKey = `draft_review_${albumId}`;

  // Initialize from local storage if it exists
  const [draft, setDraft] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : { text: '', rating: 0 };
  });

  // Auto-save to local storage whenever the draft changes
  useEffect(() => {
    if (albumId) {
      localStorage.setItem(storageKey, JSON.stringify(draft));
    }
  }, [draft, albumId]);

  return [draft, setDraft];
};