// src/api/draftApi.js
const API_BASE_URL = 'http://localhost:8080/api/my-project';

export const fetchAlbumData = async (projectIdentifier) => {
  console.log("--- API ATTEMPTING FETCH FOR:", projectIdentifier);
  try {
    const response = await fetch(`${API_BASE_URL}/${projectIdentifier}`);
    const rawData = await response.json();
    
    console.log("--- DATA RECEIVED FROM BACKEND:", rawData); // THIS SHOULD SHOW IN CONSOLE
    return rawData;
  } catch (error) {
    console.error("--- FETCH ERROR:", error);
    throw error;
  }
};