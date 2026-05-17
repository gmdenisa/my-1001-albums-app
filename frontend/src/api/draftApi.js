// src/api/draftApi.js
//
// Relative base URL — Vite proxy forwards /api/* → http://localhost:8080/api/*
// so no CORS issues in dev.
//
const API_BASE_URL = '/api/my-project';

export const fetchAlbumData = async (projectIdentifier) => {
  console.log("--- API ATTEMPTING FETCH FOR:", projectIdentifier);
  try {
    const response = await fetch(`${API_BASE_URL}/${projectIdentifier}`);
    const rawData = await response.json();
    console.log("--- DATA RECEIVED FROM BACKEND:", rawData);
    return rawData;
  } catch (error) {
    console.error("--- FETCH ERROR:", error);
    throw error;
  }
};

// 1001albumsgenerator's public API has no POST/rating endpoint.
// Reviews are submitted on their site directly.
// This helper builds the public album review URL so we can redirect there.
export const getAlbumReviewUrl = (spotifyId, albumName) => {
  if (!spotifyId) return null;
  const slug = albumName
    ? albumName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : 'album';
  return `https://1001albumsgenerator.com/albums/${spotifyId}/${slug}`;
};