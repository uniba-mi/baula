"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const express_1 = __importDefault(require("express"));
const error_1 = require("../shared/error");
const swagger_config_1 = require("../config/swagger.config");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const authentication_middleware_1 = require("../shared/middleware/authentication-middleware");
const baula_router_1 = require("./baula/baula.router");
const demo_middleware_1 = require("../shared/middleware/demo-middleware");
const bilapp_router_1 = require("./bilapp/bilapp.router");
const evaluation_router_1 = require("./evaluation/evaluation.router");
const router = express_1.default.Router();
exports.api = router;
router.use(express_1.default.json());
router.get("/", authentication_middleware_1.ensureAuthenticated, (req, res, next) => {
    if (req.user) {
        res.status(200).json({ user: req.user });
    }
    else {
        next(new error_1.BadRequestError());
    }
});
// use swagger for api docs
router.use('/docs/baula', swagger_ui_express_1.default.serveFiles(swagger_config_1.swaggerBaulaConfig, swagger_config_1.swaggerOptions), swagger_ui_express_1.default.setup(swagger_config_1.swaggerBaulaConfig));
router.use('/docs/bilapp', swagger_ui_express_1.default.serveFiles(swagger_config_1.swaggerBilAppConfig, swagger_config_1.swaggerOptions), swagger_ui_express_1.default.setup(swagger_config_1.swaggerBilAppConfig));
router.use('/baula', authentication_middleware_1.ensureAuthenticated, demo_middleware_1.denyDemoWrites, baula_router_1.baula);
router.use('/bilapp', bilapp_router_1.bilapp);
router.use('/evaluation', authentication_middleware_1.ensureAuthenticated, demo_middleware_1.denyDemoWrites, evaluation_router_1.evaluation);
