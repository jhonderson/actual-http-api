const swaggerJsdoc = require('swagger-jsdoc');

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
        version: '26.1.0',
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
      servers: [
        {
          url: "{protocol}://{host}:{port}/{basePath}",
          variables: {
            protocol: {
              default: process.env.SWAGGER_PROTOCOL || "http",
            },
            host: {
              default: process.env.SWAGGER_HOST || "localhost",
            },
            port: {
              default: process.env.SWAGGER_PORT || "5007",
            },
            basePath: {
              default: process.env.SWAGGER_BASE_PATH || "v1"
            }
          }
        }
      ]
    },
    // This path needs to be relative to where node was started from
    apis: ['./src/v1/routes/*.js'],
  });

exports.openapiSpecification = openapiSpecification;
