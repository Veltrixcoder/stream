const express = require('express');
const { chromium } = require('playwright');
const sig = require('./sig_stuff/sig.js');
const axios = require('axios');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
const PORT = 3000;

// --- Dynamic cookies logic ---
let cookiesArray = [];
let cookiesReady = false;

function loadCookiesFromFile() {
    try {
        const data = fs.readFileSync('./cookies.json', 'utf-8');
        const parsed = JSON.parse(data);
        if (parsed && Array.isArray(parsed.cookies)) {
            cookiesArray = parsed.cookies;
            cookiesReady = true;
            console.log('✅ Cookies loaded from cookies.json.');
        } else if (Array.isArray(parsed)) {
            cookiesArray = parsed;
            cookiesReady = true;
            console.log('✅ Cookies loaded from cookies.json.');
        } else {
            throw new Error('Invalid cookies.json format');
        }
    } catch (err) {
        cookiesReady = false;
        console.error('❌ Failed to load cookies from cookies.json:', err.message);
    }
}

// Load cookies on startup
loadCookiesFromFile();

// Helper: Extract ytInitialPlayerResponse from HTML
function extractPlayerResponse(html) {
    const match = html.match(/ytInitialPlayerResponse\s*=\s*(\{.*?\});/s);
    if (!match) throw new Error('ytInitialPlayerResponse not found');
    return JSON.parse(match[1]);
}

// Helper: Fetch and extract player response for a video ID using axios
async function fetchPlayerResponse(videoId) {
    if (!cookiesReady) {
        throw new Error('Cookies not loaded yet, please try again in a moment.');
    }
    const url = `https://m.youtube.com/watch?v=${videoId}`;
    const cookieHeader = cookiesArray.map(c => `${c.name}=${c.value}`).join('; ');
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Cookie': cookieHeader,
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
        'sec-ch-ua-arch': '""',
        'sec-ch-ua-bitness': '"64"',
        'sec-ch-ua-form-factors': '',
        'sec-ch-ua-full-version': '"138.0.7204.101"',
        'sec-ch-ua-full-version-list': '"Not)A;Brand";v="8.0.0.0", "Chromium";v="138.0.7204.101", "Google Chrome";v="138.0.7204.101"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-model': '"Nexus 5"',
        'sec-ch-ua-platform': '"Android"',
        'sec-ch-ua-platform-version': '"6.0"',
        'sec-ch-ua-wow64': '?0',
        'x-browser-channel': 'stable',
        'x-browser-copyright': 'Copyright 2025 Google LLC. All rights reserved.',
        'x-browser-validation': 'qvLgIVtG4U8GgiRPSI9IJ22mUlI=',
        'x-browser-year': '2025',
        'x-client-data': 'CI62yQEIprbJAQipncoBCPqQywEIlKHLAQiko8sBCIagzQEIofvOAQjg+84BCJn8zgEI6PzOAQiG/c4BCIn9zgEIuv3OARjP+s4BGL77zgE=',
    };
    const res = await axios.get(url, { headers });
    return extractPlayerResponse(res.data);
}

// Helper: Decipher formats using sig.js
async function decipherFormats(formats, html5player) {
    return await sig.decipherFormats(formats, html5player, {});
}

app.get('/streams/:id', async (req, res) => {
    const videoId = req.params.id;
    const py = spawn('python3', ['./yt_fetch.py', videoId]);

    let data = '';
    let error = '';

    py.stdout.on('data', (chunk) => {
        data += chunk;
    });

    py.stderr.on('data', (chunk) => {
        error += chunk;
    });

    py.on('close', (code) => {
        if (code !== 0) {
            return res.status(500).json({ error: error || 'Python script error' });
        }
        try {
            const result = JSON.parse(data);
            if (result.error) {
                return res.status(500).json({ error: result.error });
            }
            res.json(result);
        } catch (e) {
            res.status(500).json({ error: 'Failed to parse Python output' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
}); 