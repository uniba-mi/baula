"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerBilAppConfig = exports.swaggerBaulaConfig = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_schemas_1 = require("../shared/constants/swagger-schemas");
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
            schemas: swagger_schemas_1.swaggerBaulaSchema
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
            schemas: swagger_schemas_1.swaggerBilAppSchema
        },
    },
    apis: ['./src/routes/bilapp/**/*.ts', './src/routes/bilapp/**/*.js'],
};
exports.swaggerBaulaConfig = (0, swagger_jsdoc_1.default)(baulaOptions);
exports.swaggerBilAppConfig = (0, swagger_jsdoc_1.default)(bilappOptions);
