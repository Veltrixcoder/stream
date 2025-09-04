## FilmyFly Trending Scraper

A minimal Node.js server that scrapes trending movies from `https://filmyfly.navy/` and returns them as JSON.

### Prerequisites
- Node.js >= 18 (for built-in `fetch`) or `node-fetch` fallback is included

### Install
```bash
npm install
```

### Run (Local)
```bash
npm start
# Server on http://localhost:3000
```

### API Docs
- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/openapi.json`
- Production server URL is configured as `https://abcd.com` in the spec.

### Key Endpoints
- `GET /` → Health check
- `GET /home` → Trending and latest sections
- `GET /search?q=QUERY` → Search results
- `GET /hlstr/{id}` → Trace HLS URL for a given MoviesAPI id
- `GET /streams/{downloadPage}` → Resolve streams from a FilmyFly download page path

### Notes
- The scraper isolates the section between the “🔥🔥 Treding Movies 🔥🔥” and “🔥🔥Latest Movies🔥🔥” headings, matching the current DOM structure.
- If the site changes, adjust the section markers in `main.js`.

---

## Docker

Build the image:
```bash
docker build -t filmyfly-scraper .
```

Run the container:
```bash
docker run -p 3000:3000 --name filmyfly filmyfly-scraper
```

Open in browser:
- App: `http://localhost:3000`
- Docs: `http://localhost:3000/docs`


