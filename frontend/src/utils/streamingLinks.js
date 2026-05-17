// src/utils/streamingLinks.js

/**
 * Returns a deep link for the given album on the user's chosen streaming platform.
 * Spotify uses the spotify: URI scheme so the desktop/mobile app opens directly.
 */
export const getStreamingUrl = (album, platform) => {
  const query = encodeURIComponent(`${album.name} ${album.artist}`);

  switch (platform) {
    case 'spotify':
      // spotify: URI opens the installed app directly
      return album.spotifyId
        ? `spotify:album:${album.spotifyId}`
        : `spotify:search:${query}`;

    case 'apple':
      return `https://music.apple.com/search?term=${query}`;

    case 'tidal':
      return `https://tidal.com/search?q=${query}`;

    case 'youtube':
      return `https://music.youtube.com/search?q=${query}`;

    case 'deezer':
      return `https://www.deezer.com/search/${query}`;

    default:
      return album.spotifyId
        ? `spotify:album:${album.spotifyId}`
        : `spotify:search:${query}`;
  }
};

export const getPlatformLabel = (platform) => {
  const labels = {
    spotify: 'Spotify',
    apple: 'Apple Music',
    tidal: 'Tidal',
    youtube: 'YouTube Music',
    deezer: 'Deezer',
  };
  return labels[platform] || 'Spotify';
};