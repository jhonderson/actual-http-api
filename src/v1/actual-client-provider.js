const { createDirIfDoesNotExist } = require('../utils/utils');

let actualApi;

async function initializeActualApiClient() {
  actualApi = require('@actual-app/api');
  createDirIfDoesNotExist(process.env.ACTUAL_DATA_DIR);
  await actualApi.init({
      dataDir: process.env.ACTUAL_DATA_DIR,
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

async function getUserTokenThroughHttpPayload() {
  const {
    ACTUAL_SERVER_URL,
    ACTUAL_SERVER_PASSWORD,
  } = process.env;
  const res = await fetch(`${ACTUAL_SERVER_URL}account/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      loginMethod: 'password',
      password: ACTUAL_SERVER_PASSWORD
    })
  });
  if (!res.ok) {
    throw new Error(`Actual login failed – ${res.status} ${res.statusText}`);
  }
  return (await res.json()).data.token;
}

exports.downloadBudgetFile = async (cloudFileId) => {
  const response = await fetch(`${process.env.ACTUAL_SERVER_URL}sync/download-user-file`, {
      headers: {
          "X-ACTUAL-TOKEN": await getUserTokenThroughHttpPayload(),
          "X-ACTUAL-FILE-ID": cloudFileId
      }
  });
  return await response.arrayBuffer();
}

exports.getActualApiClient = async () => {
  if (!actualApi) {
    await initializeActualApiClient();
    // Invalidating actual api to force closing the budget and downloading it again at least every hour
    setTimeout(invalidateActualApiClient, 1000 * 60 * 60);
  }
  return actualApi;
}
