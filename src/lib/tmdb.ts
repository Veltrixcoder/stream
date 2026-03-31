const BASE_URL = 'https://docker-1e4b-7860.prg1.zerops.app/api/tmdb';

export interface Media {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: 'movie' | 'tv';
}

export async function fetchFromTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const queryParams = new URLSearchParams(params).toString();
  const url = `${BASE_URL}${endpoint}${queryParams ? `?${queryParams}` : ''}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
    return res.json();
  } catch (error) {
    console.error(`Error fetching from TMDB (${endpoint}):`, error);
    throw error;
  }
}

export async function getTrending(type: 'movie' | 'tv' | 'all' = 'all') {
  const data = await fetchFromTMDB<{ results: Media[] }>(`/trending/${type}/day`);
  return data.results;
}

export async function getPopularMovies() {
  const data = await fetchFromTMDB<{ results: Media[] }>('/movie/popular');
  return data.results;
}

export async function getPopularTv() {
  const data = await fetchFromTMDB<{ results: Media[] }>('/tv/popular');
  return data.results;
}

export async function getDetails(type: 'movie' | 'tv', id: string) {
  return await fetchFromTMDB<Media>(`/${type}/${id}`);
}

export async function search(query: string) {
  const data = await fetchFromTMDB<{ results: Media[] }>('/search/multi', { query });
  return data.results;
}

export function getImageUrl(path: string, size: 'w500' | 'original' = 'w500') {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
