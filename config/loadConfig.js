const env = process.env.NODE_ENV || 'development';
console.info('NODE_ENV:', env);

try {
  const config = require('./server.config');
  const envConfig = config && config[env];
  if (envConfig) {
    Object.keys(envConfig).forEach((key) => {
      process.env[key] = envConfig[key];
    });
  }
} catch (e) {
  console.info('Config variables NOT loaded from server.config.js');
}
