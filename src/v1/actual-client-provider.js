const { config } = require('../config/config');
const { createDirIfDoesNotExist } = require('../utils/utils');

let actualApi;

function getActualDataDir() {
  createDirIfDoesNotExist(config.actual.dataDir);
  return config.actual.dataDir;
}

async function initializeActualApiClient() {
  actualApi = require('@actual-app/api');
  await actualApi.init({
      dataDir: getActualDataDir(),
      serverURL: config.actual.serverUrl,
      password: config.actual.serverPassword,
  });
  console.log('Actual api client initialized successfully');
}

async function invalidateActualApiClient() {
  await actualApi.shutdown();
  actualApi = null;
  console.log('Actual api client was shut down successfully');
}

exports.getActualDataDir = () => getActualDataDir();

exports.getActualApiClient = async () => {
  if (!actualApi) {
    await initializeActualApiClient();
    // Invalidating actual api to force closing the budget and downloading it again at least every hour
    setTimeout(invalidateActualApiClient, 1000 * 60 * 60);
  }
  return actualApi;
};

exports.runAqlQuery = async (query) => {
  const api = await exports.getActualApiClient();
  return api.aqlQuery(query);
};
