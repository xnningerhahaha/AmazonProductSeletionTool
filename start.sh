#!/bin/bash

# 亚马逊选品分析系统 - 快速启动脚本

echo "🚀 启动亚马逊选品分析系统..."
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装 Node.js"
    echo "请访问 https://nodejs.org 下载安装"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ 错误: Node.js 版本过低 (当前: $(node -v), 需要: 18+)"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo ""

# 启动后端
echo "📦 启动后端服务..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "安装后端依赖..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "⚠️  警告: 未找到 .env 文件"
    echo "正在从 .env.example 创建..."
    cp .env.example .env
    echo "⚠️  请编辑 backend/.env 文件，填入你的 Amazon API 凭证"
fi

echo "启动后端开发服务器..."
npm run dev &
BACKEND_PID=$!

cd ..

# 等待后端启动
sleep 3

# 启动前端
echo ""
echo "🎨 启动前端应用..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
fi

if [ ! -f ".env" ]; then
    cp .env.example .env
fi

echo "启动前端开发服务器..."
npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "✨ 启动完成！"
echo ""
echo "📍 访问地址:"
echo "   前端: http://localhost:5173"
echo "   后端: http://localhost:5000"
echo ""
echo "⚠️  重要提示:"
echo "   1. 请确保已在 backend/.env 中配置 Amazon API 凭证"
echo "   2. 按 Ctrl+C 停止服务"
echo ""

# 等待用户中断
wait $BACKEND_PID $FRONTEND_PID
