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
        version: '0.13.0',
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
          url: "http://localhost:5007/v1"
        },
        {
          url: "https://{host}:443/{basePath}",
          variables: {
            host: {
              default: "localhost",
            },
            basePath: {
              default: "v1"
            }
          }
        }
      ]
    },
    // This path needs to be relative to where node was started from
    apis: ['./src/v1/routes/*.js'],
  });

exports.openapiSpecification = openapiSpecification;