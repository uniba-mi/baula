import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.1.0',
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
                url: '/api', // TODO test if this works for test + prod too                
            },

        ],
    },
    apis: ['./src/routes/**/*.ts', './src/routes/**/*.js'],
};

export const swaggerConfig = swaggerJsdoc(options);