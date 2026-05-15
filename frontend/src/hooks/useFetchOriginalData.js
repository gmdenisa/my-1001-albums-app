// src/hooks/useFetchOriginalData.js
import { useState, useEffect } from 'react';
import { fetchAlbumData } from '../api/draftApi';

export const useFetchOriginalData = (projectIdentifier) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projectIdentifier) {
        console.log("--- HOOK ERROR: No project identifier found in localStorage");
        return;
    }

    const loadData = async () => {
      try {
        const result = await fetchAlbumData(projectIdentifier);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [projectIdentifier]);

  return { data, isLoading, error };
};

// Add this to your api file (draftApi.js) or hook
export const fetchGlobalStats = async () => {
    const response = await fetch('http://localhost:8080/api/my-project/stats');
    return await response.json();
};