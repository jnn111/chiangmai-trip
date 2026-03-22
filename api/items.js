// Vercel KV API - 获取/添加行程项目
import { kv } from '@vercel/kv';

const TRIP_ID = 'chiangmai-march-2024';

export default async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // 获取所有项目
      const items = await kv.get(`${TRIP_ID}:items`) || [];
      return res.status(200).json({ items });
    }

    if (req.method === 'POST') {
      // 添加新项目
      const { day, type, name, time, desc } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: '名称不能为空' });
      }

      const newItem = {
        id: Date.now().toString(),
        day: parseInt(day) || 1,
        type: type || 'other',
        name,
        time: time || '',
        desc: desc || '',
        createdAt: new Date().toISOString()
      };

      const items = await kv.get(`${TRIP_ID}:items`) || [];
      items.push(newItem);
      await kv.set(`${TRIP_ID}:items`, items);

      return res.status(200).json({ item: newItem });
    }

    if (req.method === 'DELETE') {
      // 删除项目
      const { id } = req.query;
      let items = await kv.get(`${TRIP_ID}:items`) || [];
      items = items.filter(item => item.id !== id);
      await kv.set(`${TRIP_ID}:items`, items);

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
