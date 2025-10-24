"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studyprogramme = void 0;
const express_1 = __importDefault(require("express"));
const studyprogramme_controller_1 = require("./studyprogramme.controller");
const router = express_1.default.Router();
exports.studyprogramme = router;
//false: only support simple bodys, true would support rich data
router.use(express_1.default.urlencoded({ extended: false }));
//json data will be extracted
router.use(express_1.default.json());
// Request to GET all studyprogrammes saved in the database
router.get('/all', studyprogramme_controller_1.getAll);
// Request to GET one specific studyprogramme
router.get('/:id/:version', studyprogramme_controller_1.getOne);
