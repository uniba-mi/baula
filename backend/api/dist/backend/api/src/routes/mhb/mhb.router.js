"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mhb = void 0;
const express_1 = __importDefault(require("express"));
const mhb_controller_1 = require("./mhb.controller");
const router = express_1.default.Router();
exports.mhb = router;
// get mod from id and version
router.get('/module/:acronym/:version', mhb_controller_1.getModByAcronymAndVersion);
// get all modules
router.get('/modules', mhb_controller_1.getAllModules);
// get all modules filtered with equivalence list
router.get('/current-modules', mhb_controller_1.getAllCurrentModules);
// Get mhb-structure from specific id
router.get('/:id/:version', mhb_controller_1.getMhbByIdAndVersion);
