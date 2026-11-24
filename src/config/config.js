const fs = require('fs');

const loadOptionalSecret = (name) => {
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
  return undefined;
}

const loadMandatorySecret = (name) => {
  const value = loadOptionalSecret(name);
  if (value) return value;
  throw new Error(`Missing required secret: ${name} or ${name}_PATH`);
}

// The Actual server is reached with either its password or an Actual session token (not both).
const loadActualCredentials = () => {
  const password = loadOptionalSecret("ACTUAL_SERVER_PASSWORD");
  const sessionToken = loadOptionalSecret("ACTUAL_SERVER_SESSION_TOKEN");
  if (password && sessionToken) {
    throw new Error('Set either ACTUAL_SERVER_PASSWORD (or _PATH) or ACTUAL_SERVER_SESSION_TOKEN (or _PATH), not both');
  }
  if (!password && !sessionToken) {
    throw new Error('Missing required secret: ACTUAL_SERVER_PASSWORD or ACTUAL_SERVER_PASSWORD_PATH (or ACTUAL_SERVER_SESSION_TOKEN / ACTUAL_SERVER_SESSION_TOKEN_PATH)');
  }
  return { serverPassword: password, serverSessionToken: sessionToken };
}

// Minutes without a request after which the Actual client is shut down and the budget closed.
const loadClientIdleTimeoutMinutes = () => {
  const raw = process.env.ACTUAL_CLIENT_IDLE_TIMEOUT_MINUTES;
  if (raw === undefined || raw.trim() === '') return 60;
  const minutes = Number(raw);
  if (!Number.isFinite(minutes) || minutes <= 0) {
    throw new Error(`ACTUAL_CLIENT_IDLE_TIMEOUT_MINUTES must be a positive number of minutes, got "${raw}"`);
  }
  return minutes;
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
    ...loadActualCredentials(),
  },
  actualClientIdleTimeoutMinutes: loadClientIdleTimeoutMinutes(),
  allowedBudgetSyncIds: process.env.ALLOWED_BUDGET_SYNC_IDS ? process.env.ALLOWED_BUDGET_SYNC_IDS.split(',').map(id => id.trim()).filter(Boolean) : null,
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
