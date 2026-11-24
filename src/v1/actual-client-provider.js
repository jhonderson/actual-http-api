const { config } = require('../config/config');
const { createDirIfDoesNotExist } = require('../utils/utils');

let actualApi;
let idleTimer;

function getActualDataDir() {
  createDirIfDoesNotExist(config.actual.dataDir);
  return config.actual.dataDir;
}

async function initializeActualApiClient() {
  actualApi = require('@actual-app/api');
  // A session token (or an Actual API key) signs in without the password; otherwise use the server password.
  const credentials = config.actual.serverSessionToken
    ? { sessionToken: config.actual.serverSessionToken }
    : { password: config.actual.serverPassword };
  await actualApi.init({
      dataDir: getActualDataDir(),
      serverURL: config.actual.serverUrl,
      ...credentials,
  });
  console.log('Actual api client initialized successfully');
}

async function invalidateActualApiClient() {
  idleTimer = null;
  await actualApi.shutdown();
  actualApi = null;
  console.log('Actual api client was shut down successfully');
}

exports.getActualDataDir = () => getActualDataDir();

exports.getActualApiClient = async () => {
  if (!actualApi) {
    await initializeActualApiClient();
  }
  // The client is shut down only after a period with no requests, so a long run of requests
  // is never cut off half-way. Each request already syncs the open budget with the server.
  clearTimeout(idleTimer);
  idleTimer = setTimeout(invalidateActualApiClient, config.actualClientIdleTimeoutMinutes * 60 * 1000);
  return actualApi;
};

exports.runAqlQuery = async (query) => {
  const api = await exports.getActualApiClient();
  return api.aqlQuery(query);
};
