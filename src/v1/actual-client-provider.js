const { createDirIfDoesNotExist } = require('../utils/utils');

let actualApi;

function getActualDataDir() {
  createDirIfDoesNotExist(process.env.ACTUAL_DATA_DIR);
  return process.env.ACTUAL_DATA_DIR;
}

async function initializeActualApiClient() {
  actualApi = require('@actual-app/api');
  await actualApi.init({
      dataDir: getActualDataDir(),
      serverURL: process.env.ACTUAL_SERVER_URL,
      password: process.env.ACTUAL_SERVER_PASSWORD,
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
}
