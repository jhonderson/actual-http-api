const express = require('express');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const {
  ACTUAL_SERVER_URL,
  ACTUAL_SERVER_PASSWORD,
  ACTUAL_AUTH_METHOD,
  PORT
} = process.env;

const { init, setToken } = require('@actual-app/api');

async function getToken () {
  const opts = { method: 'POST', headers: {} };

  if (ACTUAL_AUTH_METHOD === 'header') {
    // Header-based flow (Actual ≥ 24.6.0)
    opts.headers['X-Actual-Password'] = ACTUAL_SERVER_PASSWORD;
  } else {
    // Classic JSON body flow
    opts.headers['content-type'] = 'application/json';
    opts.body = JSON.stringify({ password: ACTUAL_SERVER_PASSWORD });
  }

  const res  = await fetch(`${ACTUAL_SERVER_URL}/account/login`, opts);
  if (!res.ok) {
    throw new Error(`Actual login failed – ${res.status} ${res.statusText}`);
  }
  return (await res.json()).data.token;
}

(async () => {
  const token = await getToken();
  await init({ serverURL: ACTUAL_SERVER_URL }); 
  setToken(token);                              

  const app = express();
  app.use(express.json());

  const v1Routes = require('./src/v1/routes');
  app.use('/v1', v1Routes);

  const swaggerUi = require('swagger-ui-express');
  const { openapiSpecification } = require('./src/config/swagger');
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(null, {
    swaggerOptions: { url: '/api-docs/swagger.json' }
  }));
  app.get('/api-docs/swagger.json', (_, res) => res.json(openapiSpecification));

  /* ---- Catch-all error handler ---------------------------------------- */
  app.use((err, _req, res, _next) => {
    console.error('Internal server error:', err);
    res.status(err.status || 500).json({ error: 'Internal server error' });
  });

  app.listen(PORT, () => {
    console.log(`Actual HTTP Server listening on port ${PORT}`);
  });
})().catch(err => {
  console.error('Fatal start-up error:', err);
  process.exit(1);
});

function ignoreUnhandledRejectionsCausedByActualApiLibrary (reason) {
  if (isErrorComingFromActualApi(reason) &&
     !doesActualErrorRequireRestart(reason)) {
    console.log('Ignoring unhandledRejection caused by Actual api library');
    return;
  }
  console.error('unhandledRejection', reason);
  process.exit(1);
}

function isErrorComingFromActualApi (reason) {
  return reason &&
    ((reason.stack && reason.stack.includes('@actual-app/api')) ||
     reason.type === 'APIError');
}

function doesActualErrorRequireRestart (reason) {
  return reason?.stack?.includes('We had an unknown problem opening');
}

process.on('unhandledRejection',
           ignoreUnhandledRejectionsCausedByActualApiLibrary);
