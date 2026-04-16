import type { VercelRequest, VercelResponse } from '@vercel/node';

const BACKEND_URL = 'http://54.253.14.188';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect to backend server',
    });
  }
}
