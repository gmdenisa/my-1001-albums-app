import React, { createContext, useState, useContext, useCallback } from 'react';

const DynamicThemeContext = createContext();

const rgbToHsl = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) h = s = 0;
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
};

const hslToRgb = (h, s, l) => {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
};

export const ThemeProvider = ({ children }) => {
  const [themeConfig, setThemeConfig] = useState({
    mainColor: '#1a1a1a',
    secondaryColor: '#fcfcfc',
    mainTextColor: '#ffffff',
    secondaryTextColor: '#1a1a1a',
    currentImage: ''
  });

  const updateTheme = useCallback((imageUrl) => {
    if (!imageUrl || imageUrl === themeConfig.currentImage) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 64; canvas.height = 64; 
      ctx.drawImage(img, 0, 0, 64, 64);
      const data = ctx.getImageData(0, 0, 64, 64).data;

      // Group colors into 36 "buckets" (10 degrees of Hue each)
      const hueBins = new Array(36).fill(0).map(() => ({ count: 0, hSum: 0, sSum: 0, lSum: 0 }));

      for (let i = 0; i < data.length; i += 4) {
        const [h, s, l] = rgbToHsl(data[i], data[i+1], data[i+2]);
        
        // Ignore muddy grays and pure black/white to find the true thematic color
        if (l > 15 && l < 85 && s > 15) {
          const binIndex = Math.floor(h / 10) % 36;
          hueBins[binIndex].count++;
          hueBins[binIndex].hSum += h;
          hueBins[binIndex].sSum += s;
          hueBins[binIndex].lSum += l;
        }
      }

      // Find the bucket with the most pixels (The Dominant Color)
      let dominantBin = hueBins[0];
      for (let i = 1; i < hueBins.length; i++) {
        if (hueBins[i].count > dominantBin.count) {
          dominantBin = hueBins[i];
        }
      }

      let bestColor = { h: 0, s: 0, l: 30 };
      if (dominantBin.count > 0) {
        bestColor = {
          h: dominantBin.hSum / dominantBin.count,
          s: dominantBin.sSum / dominantBin.count,
          l: dominantBin.lSum / dominantBin.count
        };
      }

      // Relaxed clamping limits to let the true color shine through
      const finalS = Math.max(20, Math.min(bestColor.s, 60)); 
      const finalL = Math.max(30, Math.min(bestColor.l, 50)); 

      const mainRGB = hslToRgb(bestColor.h, finalS, finalL);
      const paperRGB = hslToRgb(bestColor.h, 10, 96); 

      setThemeConfig({
        currentImage: imageUrl,
        mainColor: `rgb(${mainRGB.join(',')})`,
        secondaryColor: `rgb(${paperRGB.join(',')})`,
        mainTextColor: '#ffffff',
        secondaryTextColor: '#121212',
      });
    };
  }, [themeConfig.currentImage]);

  return (
    <DynamicThemeContext.Provider value={{ themeConfig, updateTheme }}>
      {children}
    </DynamicThemeContext.Provider>
  );
};

export const useTheme = () => useContext(DynamicThemeContext);