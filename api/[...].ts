import type { VercelRequest, VercelResponse } from '@vercel/node';

const serverModule = require('../../dist/server/server.js');

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const handler = serverModule.default;
    
    if (!handler || !handler.fetch) {
      console.error('Server handler not found');
      return res.status(500).json({ error: 'Server handler not found' });
    }

    // Build the request URL
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const url = `${protocol}://${host}${req.url}`;

    // Create a Request object
    const request = new Request(url, {
      method: req.method,
      headers: new Headers(req.headers as Record<string, string>),
      body: req.method !== 'GET' && req.method !== 'HEAD' 
        ? JSON.stringify(req.body || {})
        : undefined,
    });

    // Call the server handler
    const response = await handler.fetch(request, {}, {});

    // Copy response status and headers
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Send response body
    const body = await response.text();
    res.send(body);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
