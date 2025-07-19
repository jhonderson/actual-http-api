const fetch = require('node-fetch');
const { init, setToken, shutdown } = require('@actual-app/api');
const { createDirIfDoesNotExist } = require('../utils/utils');
const actualApi = require('@actual-app/api');

let isInitialized = false;

async function getToken() {
  const {
    ACTUAL_SERVER_URL,
    ACTUAL_SERVER_PASSWORD,
    ACTUAL_AUTH_METHOD,
  } = process.env;

  const opts = { method: 'POST', headers: {} };

  if (ACTUAL_AUTH_METHOD === 'header') {
    opts.headers['X-Actual-Password'] = ACTUAL_SERVER_PASSWORD;
  } else {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify({ password: ACTUAL_SERVER_PASSWORD });
  }

  const res = await fetch(`${ACTUAL_SERVER_URL}/account/login`, opts);
  if (!res.ok) {
    throw new Error(`Actual login failed – ${res.status} ${res.statusText}`);
  }
  return (await res.json()).data.token;
}

async function initializeActualClient() {
  if (isInitialized) return;  // idempotent

  const {
    ACTUAL_DATA_DIR,
    ACTUAL_SERVER_URL,
  } = process.env;

  createDirIfDoesNotExist(ACTUAL_DATA_DIR);

  await init({
    dataDir: ACTUAL_DATA_DIR,
    serverURL: ACTUAL_SERVER_URL,
  });
  const token = await getToken();
  actualApi.setToken(token);
  setTimeout(invalidateActualClient, 1000 * 60 * 60);
  process.on('unhandledRejection', reason => {
    const stack = reason?.stack || '';
    const isActualError =
      stack.includes('@actual-app/api') || reason.type === 'APIError';
    const needsRestart = stack.includes('We had an unknown problem opening');

    if (isActualError && !needsRestart) {
      console.log('Ignoring Actual API unhandledRejection:', reason.message);
    } else {
      console.error('Unhandled Rejection:', reason);
      process.exit(1);
    }
  });

  console.log('Actual API client initialized successfully');
  isInitialized = true;
}

async function getActualClient() {
  if (!isInitialized) {
    await initializeActualClient();
  }
  return require('@actual-app/api');
}

async function invalidateActualClient() {
  if (isInitialized) {
    await shutdown();
    isInitialized = false;
    console.log('Actual API client shut down successfully');
  }
}

module.exports = {
  getActualClient,
};
