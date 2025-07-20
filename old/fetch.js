const axios = require('axios');
const fs = require('fs');

// --- Config ---
const videoId = "UYw6v-naagY";

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

// --- Dynamic cookies logic ---
async function fetchRemoteCookies() {
    try {
        const resp = await axios.get('http://34.131.128.7:5000/cookies', { timeout: 10000000 });
        if (resp.data && Array.isArray(resp.data.cookies)) {
            return resp.data.cookies.map(c => `${c.name}=${c.value}`).join('; ');
        } else if (resp.data && Array.isArray(resp.data)) {
            // fallback: if response is just an array
            return resp.data.map(c => `${c.name}=${c.value}`).join('; ');
        } else {
            throw new Error('Invalid cookies API response');
        }
    } catch (err) {
        throw new Error('❌ Failed to fetch cookies: ' + err.message);
    }
}

// Helper: Extract ytInitialPlayerResponse from HTML
function extractPlayerResponse(html) {
    const match = html.match(/ytInitialPlayerResponse\s*=\s*(\{.*?\});/s);
    if (!match) throw new Error('ytInitialPlayerResponse not found');
    return JSON.parse(match[1]);
}

/**
 * Fetch player response using mobile YouTube webpage
 */
async function fetchPlayerResponse() {
    const cookieHeader = cookiesArray.map(c => `${c.name}=${c.value}`).join('; ');
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Priority': 'u=0, i',
        'Referer': 'https://m.youtube.com/',
        'Cookie': cookieHeader,
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
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
        'accept-ch': 'Sec-CH-UA-Arch, Sec-CH-UA-Bitness, Sec-CH-UA-Full-Version, Sec-CH-UA-Full-Version-List, Sec-CH-UA-Model, Sec-CH-UA-WoW64, Sec-CH-UA-Form-Factors, Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version',
        'x-browser-channel': 'stable',
        'x-browser-copyright': 'Copyright 2025 Google LLC. All rights reserved.',
        'x-browser-validation': 'qvLgIVtG4U8GgiRPSI9IJ22mUlI=',
        'x-browser-year': '2025',
        'x-client-data': 'CI62yQEIprbJAQipncoBCPqQywEIlaHLAQiko8sBCIagzQEIofvOAQjg+84BCJn8zgEI6PzOAQiG/c4BCIn9zgEYz/rOARi++84B',
    };
    const url = `https://m.youtube.com/watch?v=${videoId}`;
    
    console.log(`🌐 Fetching mobile YouTube webpage...`);
    console.log(`📋 Using authenticated cookies: ${cookieHeader.substring(0, 100)}...`);
    console.log(`🔗 URL: ${url}`);
    
    // Add a small delay to mimic human behavior
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const res = await axios.get(url, { 
        headers,
        timeout: 30000,
        maxRedirects: 5,
        validateStatus: function (status) {
            return status >= 200 && status < 400; // Accept redirects
        }
    });
    
    console.log(`📄 Extracting player response from HTML...`);
    const playerResponse = extractPlayerResponse(res.data);
    
    fs.writeFileSync('innertube_player_response.json', JSON.stringify(playerResponse, null, 2));
    console.log(`✅ Saved to innertube_player_response.json`);
    
    return playerResponse;
}

/**
 * Main function
 */
async function main() {
    try {
        const playerResponse = await fetchPlayerResponse();
        
        // Optional: log audio/video URLs
        const streamingData = playerResponse.streamingData || {};
        const formats = streamingData.formats || [];
        const adaptiveFormats = streamingData.adaptiveFormats || [];

        const urls = [...formats, ...adaptiveFormats]
            .map(f => ({ mime: f.mimeType, url: f.url || f.signatureCipher }))
            .filter(f => f.url);

        console.log("\n🎵 Available Streams:");
        urls.forEach((u, i) => {
            console.log(`${i + 1}. ${u.mime}`);
            console.log(`    ${decodeURIComponent(u.url.split('&').find(p => p.startsWith('url='))?.slice(4) || u.url)}\n`);
        });
    } catch (err) {
        console.error("❌ Error:", err.message);
    }
}

main();
