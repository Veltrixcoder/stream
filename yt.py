from flask import Flask, jsonify, request
import requests
import json
import re
import time
import os
from urllib.parse import unquote, parse_qs, urlparse
import subprocess
import tempfile

app = Flask(__name__)

# Global variables for cookies
cookies_array = []
cookies_ready = False

def load_cookies_from_file():
    """Load cookies from cookies.json file"""
    global cookies_array, cookies_ready
    try:
        with open('./cookies.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        if isinstance(data, dict) and 'cookies' in data and isinstance(data['cookies'], list):
            cookies_array = data['cookies']
            cookies_ready = True
            print('✅ Cookies loaded from cookies.json.')
        elif isinstance(data, list):
            cookies_array = data
            cookies_ready = True
            print('✅ Cookies loaded from cookies.json.')
        else:
            raise ValueError('Invalid cookies.json format')
    except Exception as err:
        cookies_ready = False
        print(f'❌ Failed to load cookies from cookies.json: {str(err)}')

def extract_player_response(html):
    """Extract ytInitialPlayerResponse from HTML"""
    pattern = r'ytInitialPlayerResponse\s*=\s*(\{.*?\});'
    match = re.search(pattern, html, re.DOTALL)
    if not match:
        raise Exception('ytInitialPlayerResponse not found')
    return json.loads(match.group(1))

def extract_player_js_url(html):
    """Extract the player JavaScript URL from HTML"""
    patterns = [
        r'"jsUrl":"([^"]*)"',
        r'"PLAYER_JS_URL":"([^"]*)"',
        r'/s/player/[^/]+/[^/]+/base\.js',
        r'src="([^"]*base\.js[^"]*)"'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, html)
        if match:
            js_url = match.group(1)
            if js_url.startswith('//'):
                js_url = 'https:' + js_url
            elif js_url.startswith('/'):
                js_url = 'https://www.youtube.com' + js_url
            return js_url
    
    # Default fallback URL (you can update this as needed)
    return "https://m.youtube.com/s/player/69b31e11/player-plasma-ias-phone-en_US.vflset/base.js"

def get_player_response(video_id):
    """Fetch player response using mobile YouTube webpage"""
    cookie_header = '; '.join([f"{c['name']}={c['value']}" for c in cookies_array])
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Priority': 'u=0, i',
        'Referer': 'https://m.youtube.com/',
        'Cookie': cookie_header,
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
    }
    
    url = f'https://m.youtube.com/watch?v={video_id}'
    
    print(f'🌐 Fetching mobile YouTube webpage for video: {video_id}')
    
    response = requests.get(url, headers=headers, timeout=30, allow_redirects=True)
    response.raise_for_status()
    
    player_response = extract_player_response(response.text)
    player_js_url = extract_player_js_url(response.text)
    
    return player_response, player_js_url, response.text

def save_response_and_decipher(player_response, player_js_url, video_id):
    """Save exact response to /old/res.json and run node old/yt.js for deciphering"""
    
    # Ensure /old directory exists
    os.makedirs('./old', exist_ok=True)
    
    # Save exact player_response without any modifications
    res_json_path = './old/res.json'
    try:
        with open(res_json_path, 'w', encoding='utf-8') as f:
            json.dump(player_response, f, separators=(',', ':'), ensure_ascii=False)
        print(f'✅ Saved exact player response to {res_json_path}')
    except Exception as e:
        print(f'❌ Failed to save response data: {e}')
        return None
    
    # Check if yt.js exists in /old directory
    yt_js_path = './old/yt.js'
    if not os.path.exists(yt_js_path):
        print(f'❌ {yt_js_path} not found')
        return None
    
    # Run node old/yt.js
    try:
        print('🔧 Running Node.js deciphering script...')
        result = subprocess.run(
            ['node', yt_js_path],
            cwd='.',  # Set working directory to current directory
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            print('✅ Node.js deciphering script completed successfully')
            print(f'📄 Script output: {result.stdout}')
            
            # Check if de.json was generated
            de_json_path = './old/de.json'
            if os.path.exists(de_json_path):
                try:
                    with open(de_json_path, 'r', encoding='utf-8') as f:
                        deciphered_data = json.load(f)
                    print('✅ Successfully loaded deciphered data from de.json')
                    return deciphered_data
                except Exception as e:
                    print(f'❌ Failed to load de.json: {e}')
                    return None
            else:
                print('❌ de.json not found after running deciphering script')
                return None
        else:
            print(f'❌ Node.js script failed: {result.stderr}')
            return None
            
    except subprocess.TimeoutExpired:
        print('❌ Node.js script timed out')
        return None
    except Exception as e:
        print(f'❌ Error running Node.js script: {e}')
        return None

def process_streams_with_external_js(player_response, player_js_url, video_id):
    """Process streams using external Node.js script and clean up JSON files after use"""
    import os
    
    # Try to decipher using external Node.js script
    deciphered_data = save_response_and_decipher(player_response, player_js_url, video_id)
    res_json_path = './old/res.json'
    de_json_path = './old/de.json'
    streams = None
    
    if deciphered_data and isinstance(deciphered_data, dict):
        print("✅ Successfully deciphered streams using external Node.js script")
        # Convert dict to list of stream objects with url included
        streams = []
        for url, info in deciphered_data.items():
            if isinstance(info, dict):
                stream = dict(info)  # copy
                stream['url'] = url
                streams.append(stream)
        print(f"✅ Transformed de.json to list of {len(streams)} streams")
    else:
        print("❌ Fallback: Processing without deciphering")
        # Fallback: return raw formats without deciphering
        streaming_data = player_response.get('streamingData', {})
        formats = streaming_data.get('formats', [])
        adaptive_formats = streaming_data.get('adaptiveFormats', [])
        all_formats = formats + adaptive_formats
        streams = []
        for format_data in all_formats:
            stream_info = {
                'itag': format_data.get('itag'),
                'mimeType': format_data.get('mimeType'),
                'quality': format_data.get('quality'),
                'qualityLabel': format_data.get('qualityLabel'),
                'bitrate': format_data.get('bitrate'),
                'audioChannels': format_data.get('audioChannels'),
                'fps': format_data.get('fps'),
                'width': format_data.get('width'),
                'height': format_data.get('height'),
                'contentLength': format_data.get('contentLength'),
                'deciphered': False
            }
            if 'url' in format_data:
                stream_info['url'] = format_data['url']
            elif 'signatureCipher' in format_data:
                stream_info['signatureCipher'] = format_data['signatureCipher']
                stream_info['needs_decipher'] = True
            stream_info = {k: v for k, v in stream_info.items() if v is not None}
            streams.append(stream_info)
    
    # Delete both JSON files after use
    for path in [res_json_path, de_json_path]:
        try:
            os.remove(path)
            print(f"🗑️ Deleted {path}")
        except Exception as e:
            print(f"⚠️ Could not delete {path}: {e}")
    
    return streams

@app.route('/stream/<video_id>')
def get_stream_urls(video_id):
    """API endpoint to get deciphered stream URLs for a YouTube video"""
    try:
        if not cookies_ready:
            return jsonify({
                'error': 'Cookies not loaded',
                'message': 'Please ensure cookies.json file exists and is properly formatted'
            }), 500
        
        # Get player response and JavaScript URL
        player_response, player_js_url, html_content = get_player_response(video_id)
        
        # Check if video is available
        if 'videoDetails' not in player_response:
            return jsonify({
                'error': 'Video not found',
                'message': 'Could not retrieve video details'
            }), 404
        
        video_details = player_response['videoDetails']
        
        # Process streams using external Node.js script
        streams = process_streams_with_external_js(player_response, player_js_url, video_id)
        
        # Separate deciphered and non-deciphered streams for response
        deciphered_streams = [s for s in streams if s.get('deciphered', False)]
        needs_decipher_count = len([s for s in streams if s.get('needs_decipher', False)])
        
        return jsonify({
            'success': True,
            'video_id': video_id,
            'title': video_details.get('title', 'Unknown'),
            'duration': video_details.get('lengthSeconds', 'Unknown'),
            'author': video_details.get('author', 'Unknown'),
            'view_count': video_details.get('viewCount', 'Unknown'),
            'streams': streams,
            'player_js_url': player_js_url,
            'total_streams': len(streams),
            'deciphered_streams': len(deciphered_streams),
            'needs_decipher_count': needs_decipher_count,
            'decipher_method': 'external_node_script',
            'files_saved': {
                'res_json': './old/res.json',
                'expected_output': './old/de.json'
            }
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to process video',
            'message': str(e),
            'video_id': video_id
        }), 500

@app.route('/health')
def health_check():
    """Health check endpoint"""
    # Check if required files exist
    yt_js_exists = os.path.exists('./old/yt.js')
    old_dir_exists = os.path.exists('./old')
    
    return jsonify({
        'status': 'healthy',
        'cookies_ready': cookies_ready,
        'cookies_count': len(cookies_array),
        'old_directory_exists': old_dir_exists,
        'yt_js_exists': yt_js_exists,
        'required_files': {
            './cookies.json': os.path.exists('./cookies.json'),
            './old/yt.js': yt_js_exists
        }
    })

@app.route('/')
def index():
    """Root endpoint with API information"""
    return jsonify({
        'message': 'YouTube Stream Extractor API with External Node.js Deciphering',
        'endpoints': {
            '/stream/<video_id>': 'Get deciphered stream URLs for a video',
            '/health': 'Health check and system status'
        },
        'usage': 'GET /stream/UYw6v-naagY',
        'decipher_method': 'External Node.js script (old/yt.js)',
        'cookies_ready': cookies_ready,
        'workflow': [
            '1. Fetch YouTube player response',
            '2. Save response to old/res.json',
            '3. Run node old/yt.js (your deciphering script)',
            '4. Read deciphered data from old/de.json',
            '5. Return processed streams'
        ],
        'required_files': [
            'cookies.json',
            'old/yt.js (your Node.js deciphering script)'
        ],
        'generated_files': [
            'old/res.json (exact player response JSON)',
            'old/de.json (deciphered output from your script)'
        ]
    })

if __name__ == '__main__':
    # Load cookies on startup
    load_cookies_from_file()
    
    # Check if Node.js is available
    try:
        subprocess.run(['node', '--version'], capture_output=True, timeout=5)
        print('✅ Node.js is available')
    except Exception:
        print('❌ Node.js not found. Please install Node.js.')
        exit(1)
    
    # Check if required files exist
    if os.path.exists('./old/yt.js'):
        print('✅ External deciphering script found: ./old/yt.js')
    else:
        print('⚠️  ./old/yt.js not found')
        print('⚠️  Please create your Node.js deciphering script at ./old/yt.js')
    
    # Create old directory if it doesn't exist
    os.makedirs('./old', exist_ok=True)
    print('✅ Created/verified ./old directory')
    
    print('🚀 Starting YouTube Stream Extractor API with External Node.js Deciphering...')
    print('📋 Required files:')
    print('   - cookies.json (for authentication)')
    print('   - old/yt.js (your Node.js deciphering script)')
    print('📝 Generated files:')
    print('   - old/res.json (exact player response JSON)')
    print('   - old/de.json (deciphered output)')
    print('🔗 API will be available at: http://localhost:5000')
    print('📖 Usage: GET /stream/<video_id>')
    
    app.run(debug=True, host='0.0.0.0', port=5000)