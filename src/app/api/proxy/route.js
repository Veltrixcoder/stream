import { NextResponse } from 'next/server';
import { decrypt, encrypt } from '@/lib/encryption';

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
    
    let response;
    let lastError;

    if (endpoint.startsWith('/iptv')) {
      const targetBase = 'https://iptvwrapper.antig9469.workers.dev';
      const targetEndpoint = endpoint.replace('/iptv', '');
      
      const url = new URL(`${targetBase}${targetEndpoint}`);
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

      console.log('Proxying IPTV to:', url.toString());

      response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      });
    } else {
      const instances = [
        'https://docker-11-7860.ny1.zerops.app/api',
        'https://docker-23e8-7860.prg1.zerops.app/api',
        'https://veltrixcode-drishya-lbb.hf.space/api'
      ];

      for (const targetBase of instances) {
        try {
          const url = new URL(`${targetBase}${endpoint}`);
          Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

          console.log('Trying proxy to:', url.toString());

          // Implement a 6-second timeout for failover
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          const res = await fetch(url.toString(), {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            signal: controller.signal,
            next: { revalidate: 3600 } // Cache for 1 hour
          });

          clearTimeout(timeoutId);

          if (res.ok) {
            response = res;
            break;
          } else {
            console.warn(`Instance ${targetBase} returned status ${res.status}`);
            lastError = new Error(`Instance returned status ${res.status}`);
          }
        } catch (e) {
          console.error(`Error with instance ${targetBase}:`, e.message || e);
          lastError = e;
        }
      }
    }

    if (!response) {
      throw lastError || new Error('All instances failed');
    }

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
