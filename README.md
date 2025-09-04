## FilmyFly Trending Scraper

A minimal Node.js server that scrapes trending movies from `https://filmyfly.navy/` and returns them as JSON.

### Prerequisites
- Node.js >= 18 (for built-in `fetch`) or `node-fetch` fallback is included

### Install
```bash
npm install
```

### Run
```bash
npm start
# Server on http://localhost:3000
```

### Endpoints
- `GET /trending` → Returns a JSON payload like:
```json
{
  "source": "https://filmyfly.navy",
  "count": 3,
  "items": [
    {
      "title": "...",
      "thumbnail": "https://webp.imgcdn7.xyz/...webp",
      "downloadPage": "https://filmyfly.navy/page-download/...html"
    }
  ]
}
```

### Notes
- The scraper isolates the section between the “🔥🔥 Treding Movies 🔥🔥” and “🔥🔥Latest Movies🔥🔥” headings, matching the current DOM structure.
- If the site changes, adjust the section markers in `main.js`.


