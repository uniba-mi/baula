import express, { Router } from 'express';
import {
    getAll,
    getOne
} from './studyprogramme.controller';

const router: Router = express.Router();

//false: only support simple bodys, true would support rich data
router.use(express.urlencoded({ extended: false }));
//json data will be extracted
router.use(express.json());

// Request to GET all studyprogrammes saved in the database
router.get('/all', getAll);

// Request to GET one specific studyprogramme
router.get('/:id/:version', getOne);

export { router as studyprogramme };