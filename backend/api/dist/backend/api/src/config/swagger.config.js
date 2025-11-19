"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerBilAppConfig = exports.swaggerBaulaConfig = exports.swaggerOptions = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_schemas_1 = require("../shared/constants/swagger-schemas");
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
            schemas: swagger_schemas_1.swaggerBaulaSchema
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
            schemas: swagger_schemas_1.swaggerBilAppSchema
        },
    },
    apis: ['./src/routes/bilapp/**/*.ts', './src/routes/bilapp/**/*.js'],
};
exports.swaggerOptions = {
    swaggerOptions: {
        tryItOutEnabled: false,
        supportedSubmitMethods: []
    }
};
exports.swaggerBaulaConfig = (0, swagger_jsdoc_1.default)(baulaSwaggerConfig);
exports.swaggerBilAppConfig = (0, swagger_jsdoc_1.default)(bilappSwaggerConfig);
