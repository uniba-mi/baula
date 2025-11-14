import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerBaulaSchema, swaggerBilAppSchema } from '../shared/constants/swagger-schemas';

const baulaOptions = {
    definition: {
        openapi: '3.1.1',
        info: {
            title: 'Baula Swagger API',
            version: '1.0.0',
            description: 'API documentation for Baula',
        },
        // TODO: License
        // license: {
        //   name: "MIT",
        //   url: "https://spdx.org/licenses/MIT.html",
        // },
        contact: {
            name: "Baula",
            email: "baula.minf@uni-bamberg.de",
        },
        servers: [
            {
                url: '/api/baula', // TODO test if this works for test + prod too                
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token from the login endpoint'
                }
            },
        schemas: swaggerBaulaSchema
        },
    },
    apis: ['./src/routes/baula/**/*.ts', './src/routes/baula/**/*.js'],
};

const bilappOptions = {
    definition: {
        openapi: '3.1.1',
        info: {
            title: 'BilApp Swagger API',
            version: '1.0.0',
            description: 'API documentation for BilApp',
        },
        // TODO: License
        // license: {
        //   name: "MIT",
        //   url: "https://spdx.org/licenses/MIT.html",
        // },
        contact: {
            name: "BilApp",
            email: "baula.minf@uni-bamberg.de",
        },
        servers: [
            {
                url: '/api/bilapp', // TODO test if this works for test + prod too                
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token from the login endpoint'
                }
            },
        schemas: swaggerBilAppSchema
        },
    },
    apis: ['./src/routes/bilapp/**/*.ts', './src/routes/bilapp/**/*.js'],
};

export const swaggerBaulaConfig = swaggerJsdoc(baulaOptions);
export const swaggerBilAppConfig = swaggerJsdoc(bilappOptions);