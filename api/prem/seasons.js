import { listSeasons, sendJson } from '../../server/premData.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    return sendJson(res, 200, await listSeasons());
  } catch (error) {
    return sendJson(res, error.status || 500, {
      error: error.message || 'Failed to fetch seasons',
    });
  }
}
