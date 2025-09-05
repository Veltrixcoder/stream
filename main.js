const express = require('express');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const swaggerUi = require('swagger-ui-express');
const { execFile } = require('child_process');

const ORIGIN = 'https://filmyfly.navy';

// Shared browser instance for better performance
let browser = null;

async function getBrowser() {
    if (!browser) {
        browser = await puppeteer.launch({ 
            headless: 'new', 
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] 
        });
    }
    return browser;
}

async function fetchWithPuppeteer(url, options = {}) {
    const browser = await getBrowser();
    const page = await browser.newPage();
    
    try {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });
        
        if (options.headers) {
            await page.setExtraHTTPHeaders(options.headers);
        }
        
        const response = await page.goto(url, { 
            waitUntil: 'domcontentloaded', 
            timeout: options.timeout || 30000 
        });
        
        if (!response.ok()) {
            throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
        }
        
        const html = await page.content();
        return { html, url: response.url() };
    } finally {
        await page.close();
    }
}

// Fetch HTML using system curl (follows redirects)
async function fetchWithCurl(url, options = {}) {
    const timeoutMs = options.timeout || 20000;
    const timeoutSec = Math.ceil(timeoutMs / 1000);
    const headers = options.headers || {};
    const args = [
        '-sSL',
        '--max-redirs', '5',
        '--compressed',
        '-m', String(timeoutSec),
        '-A', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
    ];
    for (const [k, v] of Object.entries(headers)) {
        args.push('-H', `${k}: ${v}`);
    }
    // Emit final URL after body
    args.push('-w', '\n-----URL_EFFECTIVE:%{url_effective}-----');
    args.push(url);

    return new Promise((resolve, reject) => {
        execFile('curl', args, { maxBuffer: 5 * 1024 * 1024 }, (err, stdout, stderr) => {
            if (err) return reject(err);
            const marker = '\n-----URL_EFFECTIVE:';
            const idx = stdout.lastIndexOf(marker);
            if (idx === -1) return resolve({ html: stdout, url });
            const html = stdout.slice(0, idx);
            const tail = stdout.slice(idx + marker.length);
            const endIdx = tail.indexOf('-----');
            const finalUrl = endIdx >= 0 ? tail.slice(0, endIdx) : url;
            resolve({ html, url: finalUrl.trim() });
        });
    });
}

// Fetch only headers using curl -I (HEAD), optionally with custom headers
async function fetchHeadersWithCurl(url, options = {}) {
    const timeoutMs = options.timeout || 15000;
    const timeoutSec = Math.ceil(timeoutMs / 1000);
    const headers = options.headers || {};
    const args = [
        '-sSI',
        '--max-redirs', '5',
        '--compressed',
        '-m', String(timeoutSec),
        '-A', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
        '-D', '-',
    ];
    for (const [k, v] of Object.entries(headers)) {
        args.push('-H', `${k}: ${v}`);
    }
    args.push(url);

    return new Promise((resolve, reject) => {
        execFile('curl', args, { maxBuffer: 512 * 1024 }, (err, stdout) => {
            if (err) return reject(err);
            const headerLines = stdout.split(/\r?\n/).filter(Boolean);
            const statusLine = headerLines[0] || '';
            const statusMatch = statusLine.match(/\s(\d{3})\s/);
            const status = statusMatch ? parseInt(statusMatch[1], 10) : 0;
            const headersObj = {};
            for (const line of headerLines.slice(1)) {
                const idx = line.indexOf(':');
                if (idx === -1) continue;
                const key = line.slice(0, idx).trim().toLowerCase();
                const val = line.slice(idx + 1).trim();
                headersObj[key] = val;
            }
            resolve({ status, headers: headersObj });
        });
    });
}

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

// Resolve against a dynamic base URL (handles redirects/domains)
function resolveUrl(href, baseUrl) {
    try {
        return new URL(href, baseUrl).href;
    } catch (_) {
        return href || '';
    }
}

function toDownloadShortPath(href) {
    if (!href) return '';
    // Expect format: /page-download/<short>
    const m = href.match(/\/page-download\/(.+)$/);
    return m ? m[1] : href.replace(/^\/+/, '');
}

async function fetchHomeHtml() {
    const { html, url } = await fetchWithPuppeteer(ORIGIN, { timeout: 15000 });
    return { html, baseUrl: url };
}

function scrapeSection($, headerRegex, nextHeaderStopRegex, baseUrl) {
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
        const link = b.find('a[href^="/page-download/"], a[href*="/page-download/"]').first();
        const downloadHref = link.attr('href') || '';
        let title = b.find('div[style*="font-weight:bold"]').first().text().trim();
        if (!title) title = link.text().trim();
        const item = {
            title: htmlDecode(title),
            thumbnail: htmlDecode(thumbnail),
            downloadPage: resolveUrl(htmlDecode(downloadHref), baseUrl)
        };
        if (item.thumbnail && item.downloadPage && item.title) items.push(item);
    });
    return items;
}

async function scrapeTrending() {
    const { html, baseUrl } = await fetchHomeHtml();
    const $ = cheerio.load(html);
    return scrapeSection($, /treding\s*movies/i, /latest\s*movies/i, baseUrl);
}

async function scrapeLatest() {
    const { html, baseUrl } = await fetchHomeHtml();
    const $ = cheerio.load(html);
    // Stop when the next h2 appears (e.g., Select Category)
    return scrapeSection($, /latest\s*movies/i, /.*/i, baseUrl);
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
        { url: 'http://34.171.138.150:3000', description: 'Production' },
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
        '/streams': {
            get: {
                summary: 'Resolve all downloadable streams from a full download page URL',
                parameters: [
                    { in: 'query', name: 'url', schema: { type: 'string' }, required: true, description: 'Full download page URL (e.g., https://filmyfly.navy/page-download/...)' }
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
        const { html, baseUrl } = await fetchHomeHtml();
        const $ = cheerio.load(html);
        const trending = scrapeSection($, /treding\s*movies/i, /latest\s*movies/i, baseUrl);
        const latest = scrapeSection($, /latest\s*movies/i, /.*/i, baseUrl);
        res.json({ source: baseUrl, trending: { count: trending.length, items: trending }, latest: { count: latest.length, items: latest } });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
});

// Search endpoint: GET /search?q=QUERY
async function fetchSearchHtml(query) {
    const candidates = [
        `${ORIGIN}/site-1.html?to-search=${encodeURIComponent(query)}`,
        `${ORIGIN}/?to-search=${encodeURIComponent(query)}`,
        `${ORIGIN}/search?to-search=${encodeURIComponent(query)}`
    ];
    let last = null;
    for (const url of candidates) {
        try {
            const r = await fetchWithCurl(url, { timeout: 20000 });
            // If response contains any download links, return it immediately
            if (/\bhref\s*=\s*"\/page-download\//i.test(r.html)) return { url: r.url, html: r.html };
            last = r;
        } catch (_) {}
    }
    if (last) return { url: last.url, html: last.html };
    // Fallback to first candidate
    const r = await fetchWithCurl(candidates[0], { timeout: 20000 });
    return { url: r.url, html: r.html };
}

function parseSearchResults(html) {
    const $ = cheerio.load(html);
    const items = [];

    function pushItem(title, thumb, href, baseUrl) {
        const downloadPage = resolveUrl(htmlDecode(href || ''), baseUrl);
        const titleClean = htmlDecode((title || '').replace(/\s+/g, ' ').trim());
        const thumbClean = htmlDecode(thumb || '');
        if (!downloadPage || !titleClean) return;
        items.push({ title: titleClean, thumbnail: thumbClean, downloadPage });
    }

    // Pattern 1: Original blocks with class .A2
    $('.A2').each((_, el) => {
        const scope = $(el);
        const links = scope.find('a[href^="/page-download/"]');
        if (!links.length) return;
        const firstLink = links.eq(0);
        const secondLink = links.eq(1);
        const href = (secondLink.attr('href') || firstLink.attr('href') || '').trim();
        const titleText = (secondLink.text() || firstLink.text() || scope.text() || '').trim();
        const imgSrc = scope.find('img').first().attr('src') || '';
        const base = $('base').attr('href') || ORIGIN;
        pushItem(titleText, imgSrc, href, base);
    });

    // Pattern 2: Card blocks similar to home page .A10
    $('.A10').each((_, block) => {
        const b = $(block);
        const img = b.find('img').first();
        const thumbnail = img.attr('src') || '';
        const link = b.find('a[href^="/page-download/"]').first();
        const href = link.attr('href') || '';
        let title = b.find('div[style*="font-weight:bold"]').first().text().trim();
        if (!title) title = link.text().trim();
        const base = $('base').attr('href') || ORIGIN;
        pushItem(title, thumbnail, href, base);
    });

    // Pattern 3: Fallback - any anchor to /page-download/
    if (items.length === 0) {
        $('a[href^="/page-download/"]').each((_, a) => {
            const link = $(a);
            const href = link.attr('href') || '';
            // Try to find a reasonable title near the link
            let title = link.text().trim();
            if (!title) title = link.closest('div,li,article,section').first().text().trim();
            // Try to find a nearby image
            const img = link.closest('div,li,article,section').find('img').first();
            const thumbnail = img.attr('src') || '';
            const base = $('base').attr('href') || ORIGIN;
            pushItem(title, thumbnail, href, base);
        });
    }

    // Deduplicate by downloadPage
    const seen = new Set();
    const dedup = [];
    for (const it of items) {
        if (seen.has(it.downloadPage)) continue;
        seen.add(it.downloadPage);
        dedup.push(it);
    }
    return dedup;
}

app.get('/search', async (req, res) => {
    try {
        const q = (req.query.q || '').toString().trim();
        if (!q) return res.status(400).json({ error: 'q required' });
        const { url, html } = await fetchSearchHtml(q);
        const items = parseSearchResults(html);
        res.json({ source: ORIGIN, query: q, count: items.length, items });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
});

// --- HLS tracer for moviesapi.club ---
async function fetchMoviesApiHtml(id) {
    const url = `https://moviesapi.club/movie/${encodeURIComponent(id)}`;
    const { html, url: finalUrl } = await fetchWithPuppeteer(url, { timeout: 20000 });
    return { url: finalUrl, html };
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

// Removed headWithHeaders - using Puppeteer for all requests now

// Use headless browser to observe first HLS (.m3u8) request from an embed page
function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
async function traceHlsFromEmbed(pageUrl) {
    const browser = await getBrowser();
    const page = await browser.newPage();
    try {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
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
        await page.close();
    }
}
async function traceHlsFromMoviesApi(id) {
    const pageUrl = `https://moviesapi.club/movie/${encodeURIComponent(id)}`;
    const browser = await getBrowser();
    const page = await browser.newPage();
    try {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
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
        await page.close();
    }
}

// Duplicate function removed - using the Puppeteer version above

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
    // Prefer explicit link button
    let href = $('.dlbtn a.dl').first().attr('href') || '';
    if (href) return href;
    // Fallback: any anchor to external protector
    const protectorSel = [
        'a[href*="linkmake"]',
        'a[href*="linksly"]',
        'a[href*="linkhub"]',
        'a[href*="short"]',
        'a[href*="/det.html"]',
        'a[href*="/detail.html"]'
    ].join(',');
    href = $(protectorSel).first().attr('href') || '';
    if (href) return href;
    // As last resort, any offsite link
    const offsite = $('a[href]').map((_, a) => $(a).attr('href') || '').get().find((u) => {
        try {
            const url = new URL(u, ORIGIN);
            return !url.href.startsWith(ORIGIN) && /https?:/i.test(url.href);
        } catch { return false; }
    });
    return offsite || '';
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

// New streams endpoint expects full download page URL in query (?url=...)
app.get('/streams', async (req, res) => {
    try {
        const downloadUrl = (req.query.url || '').toString().trim();
        if (!downloadUrl) return res.status(400).json({ error: 'url required (full download page url)' });

        // 1) Open the site download page (curl follows redirects)
        const { html: downloadHtml } = await fetchWithCurl(downloadUrl, { timeout: 15000 });

        // 2) Extract intermediate link (e.g., linkmake.in)
        const interUrl = parseIntermediateLinkFromDownloadPage(downloadHtml);
        if (!interUrl) return res.status(404).json({ error: 'intermediate link not found' });

        // 3) Open intermediate link page
        const { html: protectorHtml } = await fetchWithCurl(interUrl, { timeout: 15000 });

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
        res.json({ source: ORIGIN, downloadPage: downloadUrl, intermediate: interUrl, count: filtered.length, streams: filtered });
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
        const head = await fetchHeadersWithCurl(url, {
            timeout: 15000,
            headers: { 'Range': 'bytes=0-0' }
        });
        if (head.status < 200 || head.status >= 400) return false;
        const ct = (head.headers['content-type'] || '').toLowerCase();
        if (ct && !ct.includes('text/html')) return true;
    } catch (_) {}
    // fallback: GET a byte
    try {
        const r = await fetchWithCurl(url, { timeout: 20000, headers: { 'Range': 'bytes=0-0' } });
        // If we get any non-HTML response body, consider it valid
        if (!/<!DOCTYPE|<html/i.test(r.html)) return true;
    } catch (_) {}
    return false;
}

// Helper to fetch with UA and timeout
async function fetchPage(url) {
    const { html } = await fetchWithCurl(url, { timeout: 15000 });
    return html;
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
const server = app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    if (browser) {
        await browser.close();
    }
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    if (browser) {
        await browser.close();
    }
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});


