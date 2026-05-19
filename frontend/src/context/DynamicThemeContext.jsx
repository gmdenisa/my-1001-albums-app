// src/context/DynamicThemeContext.jsx
// Uses node-vibrant — the same algorithm Spotify uses for album background colors.
import React, { createContext, useState, useContext, useCallback } from 'react';
import { Vibrant } from 'node-vibrant/browser';

const DynamicThemeContext = createContext();

// Helper to mathematically darken an RGB array by a factor (0 to 1)
// Kept at 0.5 to keep the menu/sidebar vibrant, not just black.
const darkenRgb = ([r, g, b], factor = 0.5) => [
  Math.max(0, Math.round(r * factor)),
  Math.max(0, Math.round(g * factor)),
  Math.max(0, Math.round(b * factor))
];

// Target creamy white
const CREAMY_WHITE = '#f5f0e8';

export const ThemeProvider = ({ children }) => {
  const [themeConfig, setThemeConfig] = useState({
    mainColor: '#1a1a1a',
    secondaryColor: '#2a2a2a',
    menuColor: 'rgba(25, 25, 25, 0.97)',
    mainTextColor: CREAMY_WHITE, 
    secondaryTextColor: '#ffffff',
    currentImage: ''
  });

  const updateTheme = useCallback(async (imageUrl) => {
    if (!imageUrl || imageUrl === themeConfig.currentImage) return;

    try {
      const palette = await Vibrant.from(imageUrl)
        .quality(1)
        .getPalette();

      // Prioritize Vibrant first for a punchier, lighter Spotify look
      const mainSwatch  = palette.Vibrant ?? palette.Muted ?? palette.DarkVibrant;
      const lightSwatch = palette.LightMuted  ?? palette.LightVibrant;

      const mainRgb      = mainSwatch?.rgb  ?? [30, 20, 40];
      const secondaryRgb = lightSwatch?.rgb ?? [245, 240, 232];
      
      // Force the menu to be a 50% darker version of the main color (keeps vibrant hue)
      const menuRgb      = darkenRgb(mainRgb, 0.5);

      const mainColor      = `rgb(${mainRgb.join(',')})`;
      const menuColor      = `rgba(${menuRgb.join(',')}, 0.97)`;
      const secondaryColor = `rgb(${secondaryRgb.join(',')})`;
      
      const mainTextColor  = CREAMY_WHITE;

      setThemeConfig({
        currentImage: imageUrl,
        mainColor,
        secondaryColor,
        menuColor,
        mainTextColor,
        secondaryTextColor: '#ffffff',
      });

    } catch (err) {
      console.warn('Vibrant extraction failed:', err);
    }
  }, [themeConfig.currentImage]);

  return (
    <DynamicThemeContext.Provider value={{ themeConfig, updateTheme }}>
      {children}
    </DynamicThemeContext.Provider>
  );
};

export const useTheme = () => useContext(DynamicThemeContext);