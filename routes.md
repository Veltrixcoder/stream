# Streamflix Application Routes

This document outlines all the configured routes for the Streamflix Next.js application.

| Route | Description | Dynamic Parameters |
|-------|-------------|-------------------|
| `/` | **Home Page** - Showcases trending movies, TV shows, and featured content. | N/A |
| `/movies` | **Movies Page** - Browsing and discovery for popular and trending movies. | N/A |
| `/live-tv` | **Live TV Page** - Trending and popular TV shows currently on air. | N/A |
| `/config` | **Config Page** - User settings and preferences (currently empty). | N/A |
| `/details/[type]/[id]` | **Media Details** - Shows full details for a movie or TV show. | `type`: 'movie' or 'tv'<br>`id`: TMDB unique ID |
| `/.well-known/assetlinks.json` | **Android App Links** - Configuration for deep link handling. | N/A |

## URL Construction Examples

- **Movie Details**: `/details/movie/157336` (Interstellar)
- **TV Show Details**: `/details/tv/1396` (Breaking Bad)
- **Search**: Search results are currently integrated into the Multi-search API but will typically be handled via a future search results route.
