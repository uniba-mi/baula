import express, { Router } from "express";
import {
    addFeatureWish,
    getAllWishes,
    getTopWishes,
    hasLikedWish,
    unlikeWish,
    likeWish,
    isUsersWish
} from "./feature-wishes.controller";

const router: Router = express.Router();
router.get('/all', getAllWishes);

router.get('/top', getTopWishes);


router.post('/add', addFeatureWish);

router.get('/is-users-wish/:id', isUsersWish);

router.get('/liked/:id', hasLikedWish);

router.post('/like/:id', likeWish);

router.post('/unlike/:id', unlikeWish);

// Admin
router.post('/allow/:id');

export { router as featureWishes };