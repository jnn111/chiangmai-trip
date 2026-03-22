import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'edits.json');

// 确保数据目录存在
function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}));
  }
}

// 读取数据
function readData() {
  ensureDataDir();
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

// 写入数据
function writeData(data) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const edits = readData();
      return res.status(200).json({ edits });
    }

    if (req.method === 'POST') {
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: 'content required' });
      }

      writeData({
        content,
        updatedAt: new Date().toISOString()
      });
      
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
