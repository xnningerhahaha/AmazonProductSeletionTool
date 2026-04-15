// PM2 Ecosystem Configuration File
// Used for production deployment with PM2 process manager

module.exports = {
  apps: [
    {
      name: 'amazon-analyzer-api',
      script: './dist/server.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster', // Enable cluster mode for load balancing
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      // Logging
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Auto-restart configuration
      watch: false, // Don't watch files in production
      max_memory_restart: '500M', // Restart if memory exceeds 500MB
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // Advanced features
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Environment-specific settings
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
    },
  ],
  
  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:username/amazon-product-analyzer.git',
      path: '/var/www/amazon-analyzer',
      'post-deploy': 'cd backend && npm install && npm run build && pm2 reload ecosystem.config.cjs --env production',
      'pre-setup': '',
    },
  },
}
