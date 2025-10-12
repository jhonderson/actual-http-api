const { createDirIfDoesNotExist } = require('../utils/utils');

let actualApi;

async function initializeActualApiClientThroughHttpHeaders() {
  const {
    ACTUAL_SERVER_URL,
    ACTUAL_SERVER_PASSWORD,
    ACTUAL_DATA_DIR,
  } = process.env;
  const opts = { method: 'POST', headers: { 'X-Actual-Password': ACTUAL_SERVER_PASSWORD } };
  const res = await fetch(`${ACTUAL_SERVER_URL}account/login`, opts);
  if (!res.ok) {
    throw new Error(`Actual login failed – ${res.status} ${res.statusText}`);
  }
  const actualToken = (await res.json()).data.token;
  actualApi = require('@actual-app/api');
  createDirIfDoesNotExist(ACTUAL_DATA_DIR);
  await actualApi.init({
      dataDir: ACTUAL_DATA_DIR,
      serverURL: ACTUAL_SERVER_URL,
  });
  // This is not a legal way of accessing the nodejs api, but the only way to set the token for now
  await actualApi.internal.send('subscribe-set-token', { token: actualToken });
}

async function initializeActualApiClientThroughHttpPayload() {
  actualApi = require('@actual-app/api');
  createDirIfDoesNotExist(process.env.ACTUAL_DATA_DIR);
  await actualApi.init({
      dataDir: process.env.ACTUAL_DATA_DIR,
      serverURL: process.env.ACTUAL_SERVER_URL,
      password: process.env.ACTUAL_SERVER_PASSWORD,
  });
}

async function initializeActualApiClient() {
  if (process.env.ACTUAL_AUTH_METHOD === 'header') {
    await initializeActualApiClientThroughHttpHeaders();
  } else {
    await initializeActualApiClientThroughHttpPayload();
  }
  console.log('Actual api client initialized successfully');
}

async function invalidateActualApiClient() {
  await actualApi.shutdown();
  actualApi = null;
  console.log('Actual api client was shut down successfully');
}

exports.getActualApiClient = async () => {
  if (!actualApi) {
    await initializeActualApiClient();
    // Invalidating actual api to force closing the budget and downloading it again at least every hour
    setTimeout(invalidateActualApiClient, 1000 * 60 * 60);
  }
  return actualApi;
}