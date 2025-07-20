import requests
import re
import json
import os

def extract_player_response(html):
    match = re.search(r'ytInitialPlayerResponse\s*=\s*(\{.*?\});', html, re.DOTALL)
    if not match:
        raise ValueError("ytInitialPlayerResponse not found")
    return json.loads(match.group(1))

def fetch_and_save(video_id):
    url = f'https://m.youtube.com/watch?v={video_id}'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile)',
    }

    response = requests.get(url, headers=headers)
    response.raise_for_status()

    html = response.text
    player_response = extract_player_response(html)

    os.makedirs("old", exist_ok=True)
    with open("old/res.json", "w", encoding="utf-8") as f:
        json.dump(player_response, f, indent=2, ensure_ascii=False)

    print(f"[+] Saved ytInitialPlayerResponse for {video_id} to old/res.json")

if __name__ == "__main__":
    video_id = input("Enter YouTube video ID: ").strip()
    fetch_and_save(video_id)
