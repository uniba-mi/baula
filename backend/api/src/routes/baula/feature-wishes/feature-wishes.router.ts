import express, { Router } from "express";
import {
    addFeatureWish,
    getAllWishes,
    getTopWishes,
    hasLikedWish,
    unlikeWish,
    likeWish,
    isUsersWish,
    getUsersUnapprovedWishes
} from "./feature-wishes.controller";

const router: Router = express.Router();
router.get('/all', getAllWishes);
router.get('/is-users-wish/:id', isUsersWish);
router.get('/liked/:id', hasLikedWish);
router.get('/top', getTopWishes);
router.get('/unapproved', getUsersUnapprovedWishes);

router.post('/add', addFeatureWish);
router.post('/like/:id', likeWish);
router.post('/unlike/:id', unlikeWish);


export { router as featureWishes };