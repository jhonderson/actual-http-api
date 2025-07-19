const express = require('express');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { getActualClient } = require('./helpers/actual-client-provider');

(async () => {
  await getActualClient();

  const app = express();
  app.use(express.json());
  const v1Routes = require('./src/v1/routes');
  app.use('/v1', v1Routes);

  app.get('/health', (_req, res) => res.sendStatus(200));

  const swaggerUi = require('swagger-ui-express');
  const { openapiSpecification } = require('./src/config/swagger');
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(null, {
    swaggerOptions: { url: '/api-docs/swagger.json' }
  }));
  app.get('/api-docs/swagger.json', (_req, res) => res.json(openapiSpecification));

  app.use((err, _req, res, _next) => {
    console.error('Internal server error:', err);
    res.status(err.status || 500).json({ error: 'Internal server error' });
  });

  const port = process.env.PORT || 5007;
  app.listen(port, () =>
    console.log(`Actual HTTP Server listening on port ${port}`)
  );
})().catch(err => {
  console.error('Fatal start-up error:', err);
  process.exit(1);
});
