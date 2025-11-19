import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerBaulaSchema, swaggerBilAppSchema } from '../shared/constants/swagger-schemas';

const baulaSwaggerConfig = {
    definition: {
        openapi: '3.1.1',
        info: {
            title: 'Baula Swagger API',
            version: '1.0.0',
            description: 'API documentation for Baula',
        },
        license: {
          name: "MIT License",
          url: "https://opensource.org/license/mit",
        },
        contact: {
            name: "Baula",
            email: "baula.minf@uni-bamberg.de",
        },
        components: {
            schemas: swaggerBaulaSchema
        },
    },
    apis: ['./src/routes/baula/**/*.ts', './src/routes/baula/**/*.js'],
};

const bilappSwaggerConfig = {
    definition: {
        openapi: '3.1.1',
        info: {
            title: 'BilApp Swagger API',
            version: '1.0.0',
            description: 'API documentation for BilApp',
        },
        license: {
          name: "MIT License",
          url: "https://opensource.org/license/mit",
        },
        contact: {
            name: "BilApp",
            email: "baula.minf@uni-bamberg.de",
        },
        components: {
            schemas: swaggerBilAppSchema
        },
    },
    apis: ['./src/routes/bilapp/**/*.ts', './src/routes/bilapp/**/*.js'],
};

export const swaggerOptions = {
    swaggerOptions: { // disable interactivity
        tryItOutEnabled: false, 
        supportedSubmitMethods: []
    }
};

export const swaggerBaulaConfig = swaggerJsdoc(baulaSwaggerConfig);
export const swaggerBilAppConfig = swaggerJsdoc(bilappSwaggerConfig);