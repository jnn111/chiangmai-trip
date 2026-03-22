import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'trip-data.json');

// 初始化数据结构
function initData() {
  return {
    items: [],        // 新增的行程项目
    deletedItems: [], // 删除的项目ID列表
    edits: {},        // 编辑的内容 { itemId: { field: value } }
    notes: {},        // 备注 { spotId: content }
    updatedAt: new Date().toISOString()
  };
}

// 确保数据目录存在
function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initData(), null, 2));
  }
}

// 读取数据
function readData() {
  ensureDataDir();
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return initData();
  }
}

// 写入数据
function writeData(data) {
  ensureDataDir();
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
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
      const data = readData();
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      // 添加新项目
      const { item } = req.body;
      if (!item || !item.name) {
        return res.status(400).json({ error: 'item.name required' });
      }

      const data = readData();
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
      writeData(data);
      
      return res.status(200).json({ item: newItem });
    }

    if (req.method === 'PUT') {
      // 更新编辑内容
      const { itemId, field, value } = req.body;
      if (!itemId || !field) {
        return res.status(400).json({ error: 'itemId and field required' });
      }

      const data = readData();
      if (!data.edits[itemId]) {
        data.edits[itemId] = {};
      }
      data.edits[itemId][field] = value;
      writeData(data);
      
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      // 删除项目
      const { id, type } = req.query;
      
      const data = readData();
      
      if (type === 'preset') {
        // 删除预设项目，记录到 deletedItems
        data.deletedItems.push(id);
      } else {
        // 删除自定义项目，从 items 中移除
        data.items = data.items.filter(item => item.id !== id);
      }
      
      writeData(data);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
