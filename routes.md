# Luxa Route Documentation

This document outlines all the routes used in the Luxa web application. All routes are designed to be compatible with static export (`output: 'export'`) by utilizing search parameters for dynamic content.

## Main Navigation Routes
- **`/`**: Home page featuring trending, popular, and featured movies/TV shows.
- **`/tv`**: TV Series discovery page with categorization.
- **`/livetv`**: IPTV channel browser organized by country and category.
- **`/library`**: User's watchlist and viewing history.
- **`/search`**: Global search for movies, TV shows, and live channels.

## Dynamic Content Routes (Search Param Based)

### 1. Content Details
- **Route**: `/details`
- **Parameters**:
  - `type`: `movie` or `tv`
  - `id`: The TMDB ID of the content.
- **Example**: `/details?type=movie&id=123`
- **Description**: Displays metadata, overview, genres, and for TV series, a season/episode browser.

### 2. Media Player (Movies & TV)
- **Route**: `/watch`
- **Parameters**:
  - `type`: `movie` or `tv`
  - `id`: The TMDB ID.
  - `s` (Optional, TV only): Season number (default: 1).
  - `e` (Optional, TV only): Episode number (default: 1).
- **Example**: `/watch?type=tv&id=456&s=1&e=5`
- **Description**: The main media player interface with server selection and episode controls.

### 3. Live TV Player
- **Route**: `/watch/iptv`
- **Parameters**:
  - `id`: The unique channel ID.
- **Example**: `/watch/iptv?id=789`
- **Description**: Specialized player for HLS/IPTV streams with live status indicators.

## System Routes
- **`/config`**: Deep-link configuration page for setting up the Luxa mobile app or desktop instance.
- **`/dmca`**: Legal documentation and takedown notice page.
- **`/download`**: App download links and installation guide.

## Routing Strategy
To support **100% static export**, we avoid dynamic path segments (e.g., `/[id]`). Instead:
1. All pages are generated as static HTML files (e.g., `details.html`).
2. Client-side logic reads parameters via `useSearchParams()`.
3. This ensures the app can be hosted on any static provider (GitHub Pages, Vercel Static, etc.) without a backend server.
