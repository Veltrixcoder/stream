import { encrypt, decrypt } from './encryption';

export const fetchProxy = async (endpoint, params = {}) => {
  try {
    const payload = encrypt({ endpoint, params });
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ payload }),
    });

    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }

    return decrypt(result.data);
  } catch (error) {
    console.error('Fetch proxy error:', error);
    throw error;
  }
};

export const TMDB_API = {
  searchMovies: (query) => fetchProxy('/tmdb/search/movie', { query }),
  searchTV: (query) => fetchProxy('/tmdb/search/tv', { query }),
  getPopularMovies: () => fetchProxy('/tmdb/movie/popular'),
  getPopularTV: () => fetchProxy('/tmdb/tv/popular'),
  getMovieDetails: (id) => fetchProxy(`/tmdb/movie/${id}`),
  getTVDetails: (id) => fetchProxy(`/tmdb/tv/${id}`),
  getTrending: (type = 'movie') => fetchProxy(`/tmdb/trending/${type}/day`),
  getNowPlayingMovies: () => fetchProxy('/tmdb/movie/now_playing'),
  getTopRatedMovies: () => fetchProxy('/tmdb/movie/top_rated'),
  getAnimeMovies: () => fetchProxy('/tmdb/discover/movie', { with_genres: '16' }),
  getAiringTodayTV: () => fetchProxy('/tmdb/tv/airing_today'),
  getTopRatedTV: () => fetchProxy('/tmdb/tv/top_rated'),
};


export const SOURCES = [1, 2, 3, 4, 6, 7, 8, 9];

export const STREAM_API = {
  getSources: (sourceId, type, id, season, episode) => {
    const endpoint = type === 'movie'
      ? `/media/${sourceId}/movie`
      : `/media/${sourceId}/tv`;
    const params = { id };
    if (season) params.s = season;
    if (episode) params.e = episode;
    return fetchProxy(endpoint, params);
  }
};

export const IPTV_API = {
  getCountries: () => fetchProxy('/iptv/countries'),
  getChannels: (country, page = 1) => fetchProxy(`/iptv/country/${country}`, { page }),
  getChannelDetails: (id) => fetchProxy(`/iptv/channels/${id}`),
  searchChannels: (query) => fetchProxy('/iptv/search', { query }),
};
