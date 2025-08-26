module.exports = {
  apps: [{
    name: 'gameconnect',
    script: 'server/index.js',
    cwd: '/var/www/gameconnect',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/log/gameconnect/error.log',
    out_file: '/var/log/gameconnect/out.log',
    log_file: '/var/log/gameconnect/combined.log',
    time: true,
    // Restart policy
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};