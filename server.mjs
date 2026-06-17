// Vercel Production Server Entry Point
import serverModule from './dist/server/server.js';

const handler = serverModule.default;

if (!handler || !handler.fetch) {
  throw new Error('Server handler not found');
}

export default handler;
