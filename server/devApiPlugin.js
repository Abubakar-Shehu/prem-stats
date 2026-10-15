import { handlePremApi } from './premData.js';

/**
 * Vite middleware that serves season-aware /api/prem* routes locally.
 * Auth continues to be proxied to the Fly backend.
 */
export function premApiPlugin() {
  return {
    name: 'prem-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const host = req.headers.host || 'localhost';
          const url = new URL(req.url || '/', `http://${host}`);
          if (!url.pathname.startsWith('/api/prem')) {
            next();
            return;
          }

          const handled = await handlePremApi(req, res, url);
          if (handled === false) {
            next();
          }
        } catch (error) {
          next(error);
        }
      });
    },
  };
}
