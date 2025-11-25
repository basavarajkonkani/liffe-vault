// PM2 Ecosystem Configuration for LifeVault Backend
// This file configures PM2 process manager for production deployment

module.exports = {
  apps: [
    {
      name: 'lifevault-api',
      script: './dist/server.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster', // Enable cluster mode for load balancing
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Restart configuration
      max_memory_restart: '500M', // Restart if memory exceeds 500MB
      min_uptime: '10s', // Minimum uptime before considering app stable
      max_restarts: 10, // Maximum number of restarts within 1 minute
      autorestart: true, // Auto restart on crash
      
      // Logging
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Advanced features
      watch: false, // Don't watch files in production
      ignore_watch: ['node_modules', 'logs', 'dist'],
      
      // Environment file
      env_file: '.env.production',
    },
  ],
};
