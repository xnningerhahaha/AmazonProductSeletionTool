@echo off
REM 亚马逊选品分析系统 - Windows 快速启动脚本

echo 🚀 启动亚马逊选品分析系统...
echo.

REM 检查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误: 未安装 Node.js
    echo 请访问 https://nodejs.org 下载安装
    pause
    exit /b 1
)

echo ✅ Node.js 已安装
echo.

REM 启动后端
echo 📦 启动后端服务...
cd backend

if not exist "node_modules" (
    echo 安装后端依赖...
    call npm install
)

if not exist ".env" (
    echo ⚠️  警告: 未找到 .env 文件
    echo 正在从 .env.example 创建...
    copy .env.example .env
    echo ⚠️  请编辑 backend\.env 文件，填入你的 Amazon API 凭证
)

echo 启动后端开发服务器...
start "Backend Server" cmd /k npm run dev

cd ..

REM 等待后端启动
timeout /t 3 /nobreak >nul

REM 启动前端
echo.
echo 🎨 启动前端应用...
cd frontend

if not exist "node_modules" (
    echo 安装前端依赖...
    call npm install
)

if not exist ".env" (
    copy .env.example .env
)

echo 启动前端开发服务器...
start "Frontend Server" cmd /k npm run dev

cd ..

echo.
echo ✨ 启动完成！
echo.
echo 📍 访问地址:
echo    前端: http://localhost:5173
echo    后端: http://localhost:5000
echo.
echo ⚠️  重要提示:
echo    1. 请确保已在 backend\.env 中配置 Amazon API 凭证
echo    2. 关闭命令行窗口即可停止服务
echo.
pause
