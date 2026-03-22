#!/bin/bash

echo "🚀 清迈旅游攻略 - Vercel 部署脚本"
echo "================================"
echo ""

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 正在安装 Vercel CLI..."
    npm install -g vercel
fi

# 登录 Vercel
echo ""
echo "🔑 请登录 Vercel..."
vercel login

# 部署
echo ""
echo "🚀 开始部署..."
cd "$(dirname "$0")"
vercel --prod

echo ""
echo "✅ 部署完成！"
echo ""
echo "📱 你的攻略网址将在上面显示"
echo "🔗 分享给朋友即可访问和编辑"
