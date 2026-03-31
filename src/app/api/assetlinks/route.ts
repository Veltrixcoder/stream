import { NextResponse } from 'next/server';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  const assetlinks = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: 'com.shashwat.streamflix',
        sha256_cert_fingerprints: [
          'B9:CA:38:92:26:69:94:4D:24:6A:BA:7C:D4:A2:C8:01:D8:F8:D5:62:F3:0D:FA:AA:BF:85:67:33:20:14:ED:05',
        ],
      },
    },
  ];

  return NextResponse.json(assetlinks, {
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}
