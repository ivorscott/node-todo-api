const env = process.env.NODE_ENV || 'development'

if(env === "development" || env === "test") {
  let config = require('./config.json'),
      envConfig = config[env]
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key]
  })
}

if(env === "development") {
  process.env.NODE_ENV = "development"
}
