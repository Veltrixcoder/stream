const express = require('express');
const axios = require('axios');

const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const swaggerUi = require('swagger-ui-express');

const ORIGIN = 'https://filmyfly.navy';

function htmlDecode(text) {
    if (!text) return '';
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
}

function absoluteUrl(href) {
    if (!href) return '';
    if (/^https?:\/\//i.test(href)) return href;
    if (href.startsWith('/')) return ORIGIN + href;
    return ORIGIN + '/' + href;
}

function toDownloadShortPath(href) {
    if (!href) return '';
    // Expect format: /page-download/<short>
    const m = href.match(/\/page-download\/(.+)$/);
    return m ? m[1] : href.replace(/^\/+/, '');
}

async function fetchHomeHtml() {
    const { data: html } = await axios.get(ORIGIN, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'
        },
        timeout: 15000
    });
    return html;
}

function scrapeSection($, headerRegex, nextHeaderStopRegex) {
    // Find header h2 matching headerRegex
    const header = $('h2').filter((_, el) => headerRegex.test($(el).text())).first();
    if (!header.length) return [];

    const container = header.parent();
    const between = container.nextUntil((_, el) => {
        const firstH2 = $(el).find('h2').first();
        if (!firstH2.length) return false;
        return nextHeaderStopRegex.test(firstH2.text());
    });

    const blocks = between.filter('.A10').add(between.find('.A10'));
    const items = [];
    blocks.each((_, block) => {
        const b = $(block);
        const img = b.find('img').first();
        const thumbnail = img.attr('src') || '';
        const link = b.find('a[href^="/page-download/"]').first();
        const downloadHref = link.attr('href') || '';
        let title = b.find('div[style*="font-weight:bold"]').first().text().trim();
        if (!title) title = link.text().trim();
        const item = {
            title: htmlDecode(title),
            thumbnail: htmlDecode(thumbnail),
            downloadPage: toDownloadShortPath(htmlDecode(downloadHref))
        };
        if (item.thumbnail && item.downloadPage && item.title) items.push(item);
    });
    return items;
}

async function scrapeTrending() {
    const html = await fetchHomeHtml();
    const $ = cheerio.load(html);
    return scrapeSection($, /treding\s*movies/i, /latest\s*movies/i);
}

async function scrapeLatest() {
    const html = await fetchHomeHtml();
    const $ = cheerio.load(html);
    // Stop when the next h2 appears (e.g., Select Category)
    return scrapeSection($, /latest\s*movies/i, /.*/i);
}

const app = express();

app.get('/', (_req, res) => {
    res.type('text/plain').send('OK');
});

// --- OpenAPI (Swagger) Docs ---
const openapiSpec = {
    openapi: '3.0.3',
    info: {
        title: 'FilmyFly Scraper API',
        version: '1.0.0',
        description: 'Endpoints to scrape FilmyFly and resolve stream URLs.'
    },
    servers: [
        { url: 'https://abcd.com', description: 'Production' },
        { url: 'http://localhost:3000', description: 'Local' }
    ],
    paths: {
        '/': {
            get: {
                summary: 'Health check',
                responses: { '200': { description: 'OK' } }
            }
        },
        '/home': {
            get: {
                summary: 'Scrape home page for trending and latest',
                responses: {
                    '200': {
                        description: 'Scraped sections',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        source: { type: 'string' },
                                        trending: {
                                            type: 'object',
                                            properties: {
                                                count: { type: 'integer' },
                                                items: {
                                                    type: 'array',
                                                    items: {
                                                        type: 'object',
                                                        properties: {
                                                            title: { type: 'string' },
                                                            thumbnail: { type: 'string' },
                                                            downloadPage: { type: 'string' }
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        latest: { $ref: '#/components/schemas/Section' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/search': {
            get: {
                summary: 'Search for movies',
                parameters: [
                    { in: 'query', name: 'q', schema: { type: 'string' }, required: true }
                ],
                responses: {
                    '200': {
                        description: 'Search results',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/SearchResult' } } }
                    },
                    '400': { description: 'q required' }
                }
            }
        },
        '/hlstr/{id}': {
            get: {
                summary: 'Trace HLS url by moviesapi id',
                parameters: [
                    { in: 'path', name: 'id', schema: { type: 'string' }, required: true }
                ],
                responses: { '200': { description: 'HLS data' }, '404': { description: 'Not found' } }
            }
        },
        '/streams/{downloadPage}': {
            get: {
                summary: 'Resolve all downloadable streams from a download page path',
                parameters: [
                    { in: 'path', name: 'downloadPage', schema: { type: 'string' }, required: true, description: 'Path after /page-download/, accept wildcards' }
                ],
                responses: { '200': { description: 'Resolved streams' } }
            }
        }
    },
    components: {
        schemas: {
            Item: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    thumbnail: { type: 'string' },
                    downloadPage: { type: 'string' }
                }
            },
            Section: {
                type: 'object',
                properties: {
                    count: { type: 'integer' },
                    items: { type: 'array', items: { $ref: '#/components/schemas/Item' } }
                }
            },
            SearchResult: {
                type: 'object',
                properties: {
                    source: { type: 'string' },
                    query: { type: 'string' },
                    count: { type: 'integer' },
                    items: { type: 'array', items: { $ref: '#/components/schemas/Item' } }
                }
            }
        }
    }
};

app.get('/openapi.json', (_req, res) => {
    res.json(openapiSpec);
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, { explorer: true }));

app.get('/home', async (_req, res) => {
    try {
        const html = await fetchHomeHtml();
        const $ = cheerio.load(html);
        const trending = scrapeSection($, /treding\s*movies/i, /latest\s*movies/i);
        const latest = scrapeSection($, /latest\s*movies/i, /.*/i);
        res.json({ source: ORIGIN, trending: { count: trending.length, items: trending }, latest: { count: latest.length, items: latest } });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
});

// Search endpoint: GET /search?q=QUERY
async function fetchSearchHtml(query) {
    const url = `${ORIGIN}/site-1.html?to-search=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 20000
    });
    return { url, html: data };
}

function parseSearchResults(html) {
    const $ = cheerio.load(html);
    const items = [];
    $('.A2').each((_, el) => {
        const scope = $(el);
        const links = scope.find('a[href^="/page-download/"]');
        if (!links.length) return;
        const firstLink = links.eq(0);
        const secondLink = links.eq(1);
        const href = (secondLink.attr('href') || firstLink.attr('href') || '').trim();
        if (!href) return;
        const titleText = (secondLink.text() || firstLink.text() || '').replace(/\s+/g, ' ').trim();
        const imgSrc = scope.find('img').first().attr('src') || '';
        items.push({
            title: htmlDecode(titleText),
            thumbnail: htmlDecode(imgSrc),
            downloadPage: toDownloadShortPath(htmlDecode(href))
        });
    });
    return items;
}

app.get('/search', async (req, res) => {
    try {
        const q = (req.query.q || '').toString().trim();
        if (!q) return res.status(400).json({ error: 'q required' });
        const { url, html } = await fetchSearchHtml(q);
        const items = parseSearchResults(html);
        res.json({ source: url, query: q, count: items.length, items });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
});

// --- HLS tracer for moviesapi.club ---
async function fetchMoviesApiHtml(id) {
    const url = `https://moviesapi.club/movie/${encodeURIComponent(id)}`;
    const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 20000
    });
    return { url, html: data };
}

function extractHlsFromMoviesHtml(html) {
    // Look for .m3u8 in page source (simple heuristic)
    const direct = html.match(/https?:[^"'\s]+\.m3u8[^"'\s]*/i);
    if (direct) return direct[0];
    // Look for common JSON patterns like "file":"...m3u8"
    const jsonFile = html.match(/\"file\"\s*:\s*\"(https?:[^\"']+\.m3u8[^\"']*)\"/i);
    if (jsonFile) return jsonFile[1];
    return '';
}

async function headWithHeaders(url, referer) {
    try {
        const resp = await axios.head(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Referer': referer || 'https://moviesapi.club/',
                'Origin': 'https://moviesapi.club'
            },
            timeout: 20000,
            maxRedirects: 3,
            validateStatus: (s) => s >= 200 && s < 400
        });
        return { status: resp.status, headers: resp.headers };
    } catch (e) {
        // Fallback to GET small range
        try {
            const resp = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Referer': referer || 'https://moviesapi.club/',
                    'Origin': 'https://moviesapi.club',
                    'Range': 'bytes=0-0'
                },
                responseType: 'arraybuffer',
                timeout: 20000,
                maxRedirects: 3,
                validateStatus: (s) => s >= 200 && s < 400
            });
            return { status: resp.status, headers: resp.headers };
        } catch (err) {
            throw err;
        }
    }
}

// Use headless browser to observe first HLS (.m3u8) request from an embed page
function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
async function traceHlsFromEmbed(pageUrl) {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0');
        let found = null;
        page.on('response', async (resp) => {
            try {
                const u = resp.url();
                if (!/\.m3u8(\?|$)/i.test(u)) return;
                if (found) return;
                found = { hlsUrl: u, status: resp.status(), headers: resp.headers() };
            } catch (_) {}
        });
        await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const start = Date.now();
        while (!found && Date.now() - start < 15000) {
            await sleep(250);
        }
        return { pageUrl, result: found };
    } finally {
        await browser.close();
    }
}
async function traceHlsFromMoviesApi(id) {
    const pageUrl = `https://moviesapi.club/movie/${encodeURIComponent(id)}`;
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0');
        let found = null;
        page.on('response', async (resp) => {
            try {
                const u = resp.url();
                if (!/\.m3u8(\?|$)/i.test(u)) return;
                if (found) return;
                found = { hlsUrl: u, status: resp.status(), headers: resp.headers() };
            } catch (_) {}
        });
        await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const start = Date.now();
        while (!found && Date.now() - start < 15000) {
            await sleep(250);
        }
        return { pageUrl, result: found };
    } finally {
        await browser.close();
    }
}

// Fetch moviesapi HTML and extract the iframe embed URL
async function fetchMoviesApiHtml(id) {
    const url = `https://moviesapi.club/movie/${encodeURIComponent(id)}`;
    const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 20000
    });
    return { url, html: data };
}

function extractEmbedUrlFromMoviesHtml(html) {
    const $ = cheerio.load(html);
    let src = $('iframe#frame2').attr('src') || '';
    if (!src) src = $('iframe').first().attr('src') || '';
    return src;
}

app.get('/hlstr/:id', async (req, res) => {
    try {
        const id = (req.params.id || '').trim();
        if (!id) return res.status(400).json({ error: 'id required' });
        // 1) Get moviesapi page and find the embed URL (iframe)
        const { url: pageUrl, html } = await fetchMoviesApiHtml(id);
        const embedUrl = extractEmbedUrlFromMoviesHtml(html);
        if (!embedUrl) return res.status(404).json({ error: 'embed url not found', sourcePage: pageUrl });
        // 2) Open the embed URL and capture the first HLS request
        const traced = await traceHlsFromEmbed(embedUrl);
        if (!traced.result) return res.status(404).json({ error: 'hls not observed', sourcePage: pageUrl, embedPage: embedUrl });
        // 3) Return only referer and origin for the embed host
        const origin = (() => { try { return new URL(embedUrl).origin; } catch { return ''; } })();
        res.json({
            sourcePage: pageUrl,
            embedPage: embedUrl,
            hlsUrl: traced.result.hlsUrl,
            headers: { referer: embedUrl, origin }
        });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
});

// Parse the site download page (like down.html) to get the intermediate link (Linkmake or similar)
function parseIntermediateLinkFromDownloadPage(html) {
    const $ = cheerio.load(html);
    const link = $('.dlbtn a.dl').first().attr('href') || '';
    return link;
}

// Parse the protector page (like det.html) to get all streams with ids and qualities
function parseStreamsFromProtector(html) {
    const $ = cheerio.load(html);
    const streams = [];
    $('.dlink a').each((_, a) => {
        const href = $(a).attr('href') || '';
        const text = $(a).find('.dll').first().text().trim() || $(a).text().trim();
        const idMatch = href.match(/\/cloud\/([^/?#]+)/);
        const id = idMatch ? idMatch[1] : '';
        if (href && id) {
            streams.push({ id, quality: text.replace(/^Download\s*/i, '').trim(), url: href });
        }
    });
    return streams;
}

app.get('/streams/*', async (req, res) => {
    try {
        const shortPath = (req.params[0] || '').replace(/^\/+/, '');
        if (!shortPath) return res.status(400).json({ error: 'download page path required' });

        // 1) Open the site download page
        const downloadUrl = `${ORIGIN}/page-download/${encodeURI(shortPath)}`;
        const { data: downloadHtml } = await axios.get(downloadUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 15000
        });

        // 2) Extract intermediate link (e.g., linkmake.in)
        const interUrl = parseIntermediateLinkFromDownloadPage(downloadHtml);
        if (!interUrl) return res.status(404).json({ error: 'intermediate link not found' });

        // 3) Open intermediate link page
        const { data: protectorHtml } = await axios.get(interUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 15000
        });

        // 4) Extract streams (ids and qualities)
        const streams = parseStreamsFromProtector(protectorHtml);

        // 5) Resolve each id to final streamUrl as well, and validate URL works
        const resolved = await Promise.all(
            streams.map(async (s) => {
                const r = await resolveStreamById(s.id).catch(() => null);
                if (!r || !r.streamUrl) return null;
                const ok = await isValidStreamUrl(r.streamUrl).catch(() => false);
                if (!ok) return null;
                return { ...s, ...r };
            })
        );

        const filtered = resolved.filter(Boolean);
        res.json({ source: ORIGIN, downloadPage: shortPath, intermediate: interUrl, count: filtered.length, streams: filtered });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
});

// Shared resolver used by both /stream and /streams
async function resolveStreamById(id) {
    // Try a set of possible cloud hosts with the same id
    const cloudCandidates = [
        `https://new6.filesdl.site/cloud/${encodeURIComponent(id)}`,
        `https://new1.filesdl.in/cloud/${encodeURIComponent(id)}`,
        `https://filesdl.in/cloud/${encodeURIComponent(id)}`
    ];

    let cloudUrl = '';
    let cloudHtml = '';
    for (const u of cloudCandidates) {
        try {
            cloudHtml = await fetchPage(u);
            cloudUrl = u;
            break;
        } catch (_) {
            // try next mirror
        }
    }
    if (!cloudHtml) return null;

    const watchUrl = extractWatchUrlFromCloud(cloudHtml);
    if (!watchUrl) return null;

    const watchHtml = await fetchPage(watchUrl);
    const streamUrl = extractStreamUrlFromWatch(watchHtml);
    if (!streamUrl) return null;

    return { cloudUrl, watchUrl, streamUrl };
}

// Validate that a final stream URL is actually retrievable (avoid dead/error links)
async function isValidStreamUrl(url) {
    try {
        // Try HEAD first (some CDNs support range)
        const head = await axios.head(url, {
            headers: { 'User-Agent': 'Mozilla/5.0', 'Range': 'bytes=0-0' },
            timeout: 15000,
            maxRedirects: 3,
            validateStatus: (s) => s >= 200 && s < 400
        });
        const ct = (head.headers['content-type'] || '').toLowerCase();
        if (ct && !ct.includes('text/html')) return true;
    } catch (_) {
        // ignore and try GET
    }

    try {
        const get = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0', 'Range': 'bytes=0-0' },
            timeout: 20000,
            maxRedirects: 3,
            responseType: 'arraybuffer',
            validateStatus: (s) => s >= 200 && s < 400
        });
        const ct = (get.headers['content-type'] || '').toLowerCase();
        if (ct.includes('text/html')) {
            const text = Buffer.from(get.data).toString('utf8');
            if (/failed\s*to\s*get\s*direct\s*url/i.test(text)) return false;
            return false;
        }
        return true;
    } catch (_) {
        return false;
    }
}

// Helper to fetch with UA and timeout
async function fetchPage(url) {
    const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 15000
    });
    return data;
}

// Extract the Watch Online link from a cloud page shaped like res.html
function extractWatchUrlFromCloud(html) {
    const $ = cheerio.load(html);
    // Match anchor with text containing 'Watch Online' or href containing '/watch/'
    let a = $("a:contains('Watch Online')").first();
    if (!a.length) {
        a = $('a[href*="/watch/"]').first();
    }
    return a.attr('href') || '';
}

// Extract direct stream URL from a watch page
function extractStreamUrlFromWatch(html) {
    // Try Flowplayer-style config: src: "http..."
    const flowSrcMatch = html.match(/src\s*:\s*"(https?:[^"']+)"/i);
    if (flowSrcMatch) return flowSrcMatch[1];

    // Try video/source tags
    const $ = cheerio.load(html);
    const srcFromSource = $('video source[src]').attr('src') || '';
    if (srcFromSource) return srcFromSource;
    const srcFromVideo = $('video[src]').attr('src') || '';
    if (srcFromVideo) return srcFromVideo;

    // Try common data-file attributes
    const dataFileMatch = html.match(/data-(?:file|src)\s*=\s*"(https?:[^"']+)"/i);
    if (dataFileMatch) return dataFileMatch[1];

    return '';
}

// Single-id stream endpoint removed; use /streams/{downloadpage}

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${PORT}`);
});


