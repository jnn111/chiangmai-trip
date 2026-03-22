// 使用 Upstash Redis - 可靠的云端数据库
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_KV_REST_URL || process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_KV_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || ''
});

const TRIP_KEY = 'chiangmai:trip:data';

// 初始化数据结构
function initData() {
  return {
    items: [],
    deletedItems: [],
    edits: {},
    notes: {},
    updatedAt: new Date().toISOString()
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const data = await redis.get(TRIP_KEY) || initData();
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { item } = req.body;
      if (!item || !item.name) {
        return res.status(400).json({ error: 'item.name required' });
      }

      const data = await redis.get(TRIP_KEY) || initData();
      const newItem = {
        id: Date.now().toString(),
        day: parseInt(item.day) || 1,
        type: item.type || 'other',
        name: item.name,
        time: item.time || '',
        desc: item.desc || '',
        createdAt: new Date().toISOString()
      };
      
      data.items.push(newItem);
      data.updatedAt = new Date().toISOString();
      await redis.set(TRIP_KEY, data);
      
      return res.status(200).json({ item: newItem });
    }

    if (req.method === 'PUT') {
      const { itemId, field, value } = req.body;
      if (!itemId || !field) {
        return res.status(400).json({ error: 'itemId and field required' });
      }

      const data = await redis.get(TRIP_KEY) || initData();
      if (!data.edits[itemId]) {
        data.edits[itemId] = {};
      }
      data.edits[itemId][field] = value;
      data.updatedAt = new Date().toISOString();
      await redis.set(TRIP_KEY, data);
      
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id, type } = req.query;
      
      const data = await redis.get(TRIP_KEY) || initData();
      
      if (type === 'preset') {
        data.deletedItems.push(id);
      } else {
        data.items = data.items.filter(item => item.id !== id);
      }
      
      data.updatedAt = new Date().toISOString();
      await redis.set(TRIP_KEY, data);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
