// Vercel KV API - 获取/保存备注
import { kv } from '@vercel/kv';

const TRIP_ID = 'chiangmai-march-2024';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // 获取所有备注
      const notes = await kv.get(`${TRIP_ID}:notes`) || {};
      return res.status(200).json({ notes });
    }

    if (req.method === 'POST') {
      // 保存备注
      const { spotId, content } = req.body;
      
      if (!spotId) {
        return res.status(400).json({ error: 'spotId required' });
      }

      const notes = await kv.get(`${TRIP_ID}:notes`) || {};
      notes[spotId] = {
        content,
        updatedAt: new Date().toISOString()
      };
      await kv.set(`${TRIP_ID}:notes`, notes);

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
