const swaggerJsdoc = require('swagger-jsdoc');
const { config } = require('./config');
const pkg = require('../../package.json');

const openapiSpecification = swaggerJsdoc({
    definition: {
      openapi: '3.1.0',
      info: {
        title: 'Actual HTTP Api',
        summary: 'Basic Actual Budget API exposed through HTTP endpoints',
        description: `This HTTP api is a wrapper of the Actual Budget api for NodeJS, see its
                      documentation [here](https://actualbudget.org/docs/api/reference)<br><br>
                      <strong>Amount/currency values:</strong><br>In the context of this api, 
                      a currency amount is an integer representing the value without any decimal places.
                      <br>Usually it’s value * 100, but it depends on your currency. For example, 
                      a USD amount of $120.30 would be 12030.`,
        license: {
          name: 'MIT',
          url: 'http://opensource.org/licenses/MIT',
        },
        version: pkg.version,
      },
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            name: 'x-api-key',
            in: 'header',
            scheme: 'http',
          },
        },
      },
      servers: config.swagger.customConfigProvided ? [
        {
          url: "{protocol}://{host}:{port}/{basePath}",
          variables: {
            protocol: {
              default: config.swagger.protocol,
            },
            host: {
              default: config.swagger.host,
            },
            port: {
              default: config.swagger.port,
            },
            basePath: {
              default: config.swagger.basePath,
            }
          }
        },
      ] : [
        {
          url: "http://localhost:5007/v1"
        },
        {
          url: "{protocol}://{host}:{port}/{basePath}",
          variables: {
            protocol: {
              default: "https",
            },
            host: {
              default: "localhost",
            },
            port: {
              default: "443",
            },
            basePath: {
              default: "v1"
            }
          }
        },
      ]
    },
    // This path needs to be relative to where node was started from
    apis: ['./src/v1/routes/*.js'],
  });

exports.openapiSpecification = openapiSpecification;
// If experimental operations are disabled, remove any operations marked as unofficial
if (!config.experimentalOperationsEnabled) {
  const { UNOFFICIAL_PREFIX } = require('./constants');
  const paths = openapiSpecification.paths || {};
  Object.keys(paths).forEach((p) => {
    const methods = paths[p];
    Object.keys(methods).forEach((m) => {
      const op = methods[m];
      if (op && typeof op.summary === 'string' && op.summary.startsWith(UNOFFICIAL_PREFIX)) {
        delete methods[m];
      }
    });
    // If no methods remain on the path, remove the path entirely
    if (Object.keys(methods).length === 0) {
      delete openapiSpecification.paths[p];
    }
  });
}
