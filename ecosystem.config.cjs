module.exports = {
	apps: [
		{
			name: 'typetest',
			script: 'build/index.js',
			instances: 1,
			exec_mode: 'fork',
			autorestart: true,
			watch: false,
			max_memory_restart: '500M',
			env: {
				NODE_ENV: 'production',
				PORT: 4324,
				HOST: '0.0.0.0',
				DATABASE_URL: 'local.db',
				ADMIN_SECRET: 'admin123'
			}
		}
	]
};
