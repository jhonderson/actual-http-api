const fs = require('fs');

const loadMandatorySecret = (name) => {
  const direct = process.env[name];
  if (direct) return direct;
  const path = process.env[`${name}_PATH`];
  if (path) {
    try {
      return fs.readFileSync(path, "utf8").trim();
    } catch (err) {
      throw new Error(`Failed to read secret file at ${path}: ${err.message}`);
    }
  }
  throw new Error(`Missing required secret: ${name} or ${name}_PATH`);
}

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

exports.config = {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT || 5007,
  apiKey: loadMandatorySecret("API_KEY"),
  actual: {
    dataDir: process.env.ACTUAL_DATA_DIR,
    serverUrl: process.env.ACTUAL_SERVER_URL,
    serverPassword: loadMandatorySecret("ACTUAL_SERVER_PASSWORD"),
  },
  swagger: {
    protocol: process.env.SWAGGER_PROTOCOL || "https",
    host: process.env.SWAGGER_HOST || "localhost",
    port: process.env.SWAGGER_PORT || "443",
    basePath: process.env.SWAGGER_BASE_PATH || "v1",
    customConfigProvided: !!(process.env.SWAGGER_PROTOCOL || process.env.SWAGGER_HOST || process.env.SWAGGER_PORT || process.env.SWAGGER_BASE_PATH),
  },
  // Toggle to enable experimental / unofficial operations. Default: enabled (true).
  experimentalOperationsEnabled: (process.env.EXPERIMENTAL_OPERATIONS_ENABLED === 'false' && process.env.NODE_ENV != 'test') ? false : true,
};
