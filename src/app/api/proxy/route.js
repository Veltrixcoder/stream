import { NextResponse } from 'next/server';
import { decrypt, encrypt } from '@/lib/encryption';

const EXTERNAL_BASE_URL = 'https://veltrixcode-drishya-lbb.hf.space/api';

export async function POST(request) {
  try {
    const { payload } = await request.json();
    if (!payload) {
      return NextResponse.json({ error: 'Missing payload' }, { status: 400 });
    }

    const decrypted = decrypt(payload);
    if (!decrypted) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { endpoint, params = {} } = decrypted;
    
    let targetBase = EXTERNAL_BASE_URL;
    let targetEndpoint = endpoint;

    if (endpoint.startsWith('/iptv')) {
      targetBase = 'https://iptvwrapper.antig9469.workers.dev';
      targetEndpoint = endpoint.replace('/iptv', '');
    }

    // Construct URL with params
    const url = new URL(`${targetBase}${targetEndpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    console.log('Proxying to:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    const data = await response.json();
    console.log('Received data keys:', Object.keys(data));
    
    // Encrypt the response data back
    const encryptedResponse = encrypt(data);

    return NextResponse.json({ data: encryptedResponse });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
