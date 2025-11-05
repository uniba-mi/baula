"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerConfig = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
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
exports.swaggerConfig = (0, swagger_jsdoc_1.default)(options);
