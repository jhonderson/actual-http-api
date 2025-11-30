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
  }
};
