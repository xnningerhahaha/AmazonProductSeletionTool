# 部署指南 (Deployment Guide)

本文档提供了亚马逊选品分析系统的完整部署指南。

## 目录

- [前置要求](#前置要求)
- [后端部署](#后端部署)
- [前端部署](#前端部署)
- [环境变量配置](#环境变量配置)
- [HTTPS配置](#https配置)
- [CDN配置](#cdn配置)
- [监控和维护](#监控和维护)

## 前置要求

### 开发环境
- Node.js 18+ 
- npm 或 yarn
- Git

### 生产环境
- 云服务器 (AWS EC2, 阿里云ECS, 或类似服务)
- 域名 (用于HTTPS)
- SSL证书 (Let's Encrypt推荐)

## 后端部署

### 1. 准备服务器

```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 安装Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装PM2进程管理器
sudo npm install -g pm2

# 安装nginx (用于反向代理)
sudo apt install -y nginx
```

### 2. 部署后端代码

```bash
# 克隆代码仓库
git clone <your-repo-url>
cd amazon-product-analyzer/backend

# 安装依赖
npm install

# 配置生产环境变量
cp .env.production.example .env.production
nano .env.production  # 编辑并填入实际值

# 构建TypeScript代码
npm run build

# 使用PM2启动应用
pm2 start dist/server.js --name amazon-analyzer-api --env production

# 设置PM2开机自启
pm2 startup
pm2 save
```

### 3. 配置Nginx反向代理

创建nginx配置文件: `/etc/nginx/sites-available/amazon-analyzer-api`

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    # 请求体大小限制
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 健康检查端点
    location /health {
        proxy_pass http://localhost:5000/health;
        access_log off;
    }
}
```

启用配置:

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/amazon-analyzer-api /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启nginx
sudo systemctl restart nginx
```

### 4. 配置HTTPS (使用Let's Encrypt)

```bash
# 安装Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d api.your-domain.com

# 自动续期测试
sudo certbot renew --dry-run
```

Certbot会自动修改nginx配置以支持HTTPS。

### 5. 配置防火墙

```bash
# 允许HTTP和HTTPS
sudo ufw allow 'Nginx Full'

# 允许SSH (如果还没有)
sudo ufw allow OpenSSH

# 启用防火墙
sudo ufw enable
```

## 前端部署

### 选项1: 使用Vercel部署 (推荐)

1. 在Vercel上创建新项目
2. 连接你的Git仓库
3. 配置构建设置:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. 配置环境变量:
   - `VITE_API_BASE_URL`: `https://api.your-domain.com`

5. 部署

### 选项2: 使用Netlify部署

1. 在Netlify上创建新站点
2. 连接你的Git仓库
3. 配置构建设置:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

4. 配置环境变量:
   - `VITE_API_BASE_URL`: `https://api.your-domain.com`

5. 部署

### 选项3: 自托管 (使用Nginx)

```bash
# 在本地构建前端
cd frontend
cp .env.production.example .env.production
nano .env.production  # 填入后端API URL

npm install
npm run build

# 将dist目录上传到服务器
scp -r dist/* user@your-server:/var/www/amazon-analyzer

# 在服务器上配置nginx
```

创建nginx配置: `/etc/nginx/sites-available/amazon-analyzer-frontend`

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /var/www/amazon-analyzer;
    index index.html;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

启用并配置HTTPS:

```bash
sudo ln -s /etc/nginx/sites-available/amazon-analyzer-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 环境变量配置

### 后端环境变量 (.env.production)

```bash
# 服务器配置
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-domain.com

# Amazon API凭证
AMAZON_ACCESS_KEY=your_access_key
AMAZON_SECRET_KEY=your_secret_key
AMAZON_PARTNER_TAG=your_partner_tag
AMAZON_REGION=us-east-1
AMAZON_API_HOST=webservices.amazon.com

# 安全配置
TRUST_PROXY=true

# 速率限制
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# 日志级别
LOG_LEVEL=info
```

### 前端环境变量 (.env.production)

```bash
# API配置
VITE_API_BASE_URL=https://api.your-domain.com
```

## CDN配置

### 使用Cloudflare CDN (推荐)

1. **注册Cloudflare账号**
   - 访问 https://cloudflare.com
   - 添加你的域名

2. **更新DNS记录**
   - 将域名的nameserver更改为Cloudflare提供的nameserver
   - 等待DNS传播 (通常24-48小时)

3. **配置CDN设置**
   - 启用"Auto Minify" (自动压缩JS/CSS/HTML)
   - 启用"Brotli"压缩
   - 设置缓存级别为"Standard"

4. **配置缓存规则**
   - 静态资源 (*.js, *.css, *.png, *.jpg): 缓存1年
   - HTML文件: 缓存1小时或不缓存
   - API请求: 不缓存

5. **启用SSL/TLS**
   - SSL/TLS加密模式: "Full (strict)"
   - 启用"Always Use HTTPS"
   - 启用"Automatic HTTPS Rewrites"

6. **性能优化**
   - 启用"HTTP/2"
   - 启用"HTTP/3 (QUIC)"
   - 启用"0-RTT Connection Resumption"

### 使用AWS CloudFront

1. **创建CloudFront分发**
   - Origin: 你的前端域名或S3 bucket
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Allowed HTTP Methods: GET, HEAD, OPTIONS

2. **配置缓存行为**
   - 默认TTL: 86400 (1天)
   - 最大TTL: 31536000 (1年)
   - 压缩对象: 是

3. **配置SSL证书**
   - 使用AWS Certificate Manager (ACM)创建免费SSL证书
   - 将证书关联到CloudFront分发

4. **配置自定义域名**
   - 添加CNAME记录指向CloudFront域名

## 监控和维护

### PM2监控

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs amazon-analyzer-api

# 查看实时监控
pm2 monit

# 重启应用
pm2 restart amazon-analyzer-api

# 查看详细信息
pm2 show amazon-analyzer-api
```

### 日志管理

```bash
# 配置PM2日志轮转
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 性能监控

推荐使用以下工具:
- **PM2 Plus**: PM2官方监控平台
- **New Relic**: 应用性能监控
- **Datadog**: 全栈监控
- **Sentry**: 错误追踪

### 备份策略

```bash
# 定期备份环境变量文件
cp .env.production .env.production.backup.$(date +%Y%m%d)

# 定期备份nginx配置
sudo cp /etc/nginx/sites-available/amazon-analyzer-* /backup/nginx/
```

### 更新部署

```bash
# 拉取最新代码
cd amazon-product-analyzer/backend
git pull origin main

# 安装新依赖
npm install

# 重新构建
npm run build

# 重启应用
pm2 restart amazon-analyzer-api

# 查看日志确认启动成功
pm2 logs amazon-analyzer-api --lines 50
```

## 故障排查

### 后端无法启动

```bash
# 检查PM2日志
pm2 logs amazon-analyzer-api --err

# 检查端口占用
sudo lsof -i :5000

# 检查环境变量
pm2 env amazon-analyzer-api
```

### Nginx错误

```bash
# 检查nginx错误日志
sudo tail -f /var/log/nginx/error.log

# 测试nginx配置
sudo nginx -t

# 重启nginx
sudo systemctl restart nginx
```

### SSL证书问题

```bash
# 检查证书状态
sudo certbot certificates

# 手动续期
sudo certbot renew

# 强制续期
sudo certbot renew --force-renewal
```

## 性能优化建议

1. **启用HTTP/2**: 提升并发请求性能
2. **启用Gzip/Brotli压缩**: 减少传输数据量
3. **配置浏览器缓存**: 减少重复请求
4. **使用CDN**: 加速全球访问
5. **优化图片**: 使用WebP格式，启用懒加载
6. **代码分割**: 使用动态导入减少初始加载时间
7. **数据库连接池**: 如果使用数据库，配置连接池
8. **API响应缓存**: 缓存频繁请求的数据

## 安全检查清单

- [ ] 所有敏感信息存储在环境变量中
- [ ] 启用HTTPS
- [ ] 配置CORS正确的origin
- [ ] 实施API速率限制
- [ ] 定期更新依赖包
- [ ] 配置防火墙规则
- [ ] 启用安全HTTP头
- [ ] 定期备份配置和数据
- [ ] 监控异常访问和错误
- [ ] 使用强密码和SSH密钥认证

## 成本估算

### 基础配置 (月费用)
- **云服务器** (2核4GB): $10-20
- **域名**: $10-15/年
- **SSL证书**: 免费 (Let's Encrypt)
- **CDN**: 免费额度通常足够 (Cloudflare)
- **总计**: ~$15-25/月

### 推荐配置 (月费用)
- **云服务器** (4核8GB): $40-80
- **负载均衡器**: $10-20
- **CDN**: $20-50
- **监控服务**: $0-30
- **总计**: ~$70-180/月

## 支持和帮助

如遇到部署问题，请检查:
1. 服务器日志
2. Nginx日志
3. PM2日志
4. 浏览器控制台

或参考官方文档:
- [Express.js部署](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Vite部署](https://vitejs.dev/guide/static-deploy.html)
- [PM2文档](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx文档](https://nginx.org/en/docs/)
