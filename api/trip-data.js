// 使用内存存储 - 简单可靠
let memoryData = {
  items: [],
  deletedItems: [],
  edits: {},
  notes: {},
  updatedAt: new Date().toISOString()
};

const TRIP_KEY = 'chiangmai:trip:data';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      return res.status(200).json(memoryData);
    }

    if (req.method === 'POST') {
      const { item } = req.body;
      if (!item || !item.name) {
        return res.status(400).json({ error: 'item.name required' });
      }

      const newItem = {
        id: Date.now().toString(),
        day: parseInt(item.day) || 1,
        type: item.type || 'other',
        name: item.name,
        time: item.time || '',
        desc: item.desc || '',
        createdAt: new Date().toISOString()
      };
      
      memoryData.items.push(newItem);
      memoryData.updatedAt = new Date().toISOString();
      
      return res.status(200).json({ item: newItem });
    }

    if (req.method === 'PUT') {
      const { itemId, field, value } = req.body;
      if (!itemId || !field) {
        return res.status(400).json({ error: 'itemId and field required' });
      }

      if (!memoryData.edits[itemId]) {
        memoryData.edits[itemId] = {};
      }
      memoryData.edits[itemId][field] = value;
      memoryData.updatedAt = new Date().toISOString();
      
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id, type } = req.query;
      
      if (type === 'preset') {
        memoryData.deletedItems.push(id);
      } else {
        memoryData.items = memoryData.items.filter(item => item.id !== id);
      }
      
      memoryData.updatedAt = new Date().toISOString();
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
