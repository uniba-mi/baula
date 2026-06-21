import { NextFunction, Request, Response } from "express";
import { UserServer } from "../../../../../../interfaces/user";
import { FeatureWish } from "../../../database/mongo";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../../../shared/error";

export async function addFeatureWish(req: Request, res: Response, next: NextFunction) {
    const maxAmountOfUnapprovedWishes = 5;
    const user = req.user as UserServer;

    const usersUnapprovedWishes = await getUnapprovedWishesOfUser(user._id);

    if (usersUnapprovedWishes >= maxAmountOfUnapprovedWishes) {
        next(new BadRequestError(
            `Du kannt maximal ${maxAmountOfUnapprovedWishes} noch ungenehmigte Wünsche haben. \n` +
            `Versuche es später noch einmal.`
        ));
        return;
    }

    const title = req.body.title;
    const description = req.body.description;
    const icon = req.body.icon;
    const isValid = validateFeatureWish(title, description);
    if (isValid != true) {
        next(new BadRequestError(isValid as string));
        console.log("Bad Request: ", isValid);
        return;
    }

    await createFeatureWish(title, description, user._id, icon)
        .then((wish) => {
            res.send(wish);
        })
        .catch((error) => {
            next(new Error("Failed to create feature wish: " + error.message));
        });
}

function validateFeatureWish(title: string, description: string): boolean | string {
    const maxTitleLength = 200;
    const minTitleLength = 2;
    const maxDescriptionLength = 1000;
    let errorMessage = "Bei dem Feature-Wunsch ist folgendes Problem aufgetreten: ";
    let isValid = true;

    if (!title || !description) {
        return "Es muss ein Titel und eine Beschreibung angegeben werden.";
    }

    if (title.length > maxTitleLength) {
        errorMessage += `Der Titel darf maximal ${maxTitleLength} Zeichen lang sein. \n`;
        isValid = false;
    }

    if (description.length > maxDescriptionLength) {
        errorMessage += `Die Beschreibung darf maximal ${maxDescriptionLength} Zeichen lang sein. \n`;
        isValid = false;
    }
    if (title.length < minTitleLength) {
        errorMessage += `Der Titel muss mindestens ${minTitleLength} Zeichen lang sein. \n`;
        isValid = false;
    }
    if (!isValid) return errorMessage;
    return true;
}

async function createFeatureWish(title: string, description: string, userId?: string, icon?: string): Promise<typeof FeatureWish> {
    return new Promise(async (resolve, reject) => {
        try {
            const newWish = new FeatureWish({
                title: title,
                description: description,
                likedBy: userId ? [userId] : [],
                createdAt: new Date(),
                isAllowed: false,
                createdBy: userId,
                icon: icon,
            });

            await newWish.save();
            resolve((newWish as unknown) as typeof FeatureWish);
        } catch (error) {
            reject(error);
        }
    });
}

async function getUnapprovedWishesOfUser(userId: string): Promise<number> {
    const unapprovedWishes = await FeatureWish.find({ isAllowed: false });

    const usersUnapprovedWishes: number = unapprovedWishes.filter(
        wish => wish.createdBy?.toString() == userId.toString())
        .length;
    return usersUnapprovedWishes;
}

export async function getTopWishes(req: Request, res: Response, next: NextFunction) {
    const topWishesAmount: number = 3;
    const allWished = await FeatureWish.find({ isAllowed: true }).sort({ likedBy: -1, createdAt: -1 }).limit(topWishesAmount).exec();

    if (!allWished) {
        next(new NotFoundError("Es wurden keine Feature-Wünsche gefunden."));
        return;
    }

    // Calculate likes, remove likedBy field
    const response = allWished.map(wish => {
        const obj = (wish as any).toObject ? (wish as any).toObject() : { ...wish };
        return {
            ...obj,
            likes: obj.likedBy?.length || 0,
            likedBy: undefined,
        };
    });

    res.send(response);
}

export async function getAllWishes(req: Request, res: Response, next: NextFunction) {
    const allWished = await FeatureWish.find({ isAllowed: true }).exec();

    if (!allWished) {
        next(new NotFoundError("Es wurden keine Feature-Wünsche gefunden."));
        return;
    }

    // Calculate likes, remove likedBy field
    const response = allWished.map(wish => {
        const obj = (wish as any).toObject ? (wish as any).toObject() : { ...wish };
        return {
            ...obj,
            likes: obj.likedBy?.length || 0,
            likedBy: undefined,
        };
    });

    res.send(response);
}

export async function hasLikedWish(req: Request, res: Response, next: NextFunction) {
    const user = req.user as UserServer;

    const wishId = req.params.id;
    if (!wishId) {
        next(new BadRequestError("Es muss eine ID für den Feature-Wunsch angegeben werden."));
        return;
    }

    const wish = await FeatureWish.findById(wishId).exec();
    if (!wish) {
        next(new NotFoundError("Der angegebene Feature-Wunsch wurde nicht gefunden."));
        return;
    }

    const hasLiked = wish.likedBy?.includes(user._id) || false;
    res.send({ hasLiked });
}

export async function likeWish(req: Request, res: Response, next: NextFunction) {
    const user = req.user as UserServer;

    const wishId = req.params.id;
    if (!wishId) {
        next(new BadRequestError("Es muss eine ID für den Feature-Wunsch angegeben werden."));
        return;
    }

    const wish = await FeatureWish.findById(wishId).exec();
    if (!wish) {
        next(new NotFoundError("Der angegebene Feature-Wunsch wurde nicht gefunden."));
        return;
    }

    if (wish.likedBy?.includes(user._id)) {
        next(new BadRequestError("Du hast diesen Wunsch bereits geliked."));
        return;
    }

    wish.likedBy = [...(wish.likedBy || []), user._id];
    await wish.save();
    res.send(wish);
}

export async function unlikeWish(req: Request, res: Response, next: NextFunction) {
    const user = req.user as UserServer;

    const wishId = req.params.id;
    if (!wishId) {
        next(new BadRequestError("Es muss eine ID für den Feature-Wunsch angegeben werden."));
        return;
    }

    const wish = await FeatureWish.findById(wishId).exec();
    if (!wish) {
        next(new NotFoundError("Der angegebene Feature-Wunsch wurde nicht gefunden."));
        return;
    }

    if (!wish.likedBy?.includes(user._id)) {
        next(new BadRequestError("Du hast diesen Wunsch nicht geliked."));
        return;
    }

    const index = wish.likedBy.indexOf(user._id, 0);
    if (index > -1) {
        wish.likedBy.splice(index, 1);
    }

    await wish.save();
    res.send(wish);
}

export async function isUsersWish(req: Request, res: Response, next: NextFunction) {
    const user = req.user as UserServer;

    const wishId = req.params.id;
    if (!wishId) {
        next(new BadRequestError("Es muss eine ID für den Feature-Wunsch angegeben werden."));
        return;
    }

    const wish = await FeatureWish.findById(wishId).exec();
    if (!wish) {
        next(new NotFoundError("Der angegebene Feature-Wunsch wurde nicht gefunden."));
        return;
    }

    const isUsersWish = wish.createdBy?.toString() == user._id.toString();

    res.send({ isUsersWish });
}

export async function getUsersUnapprovedWishes(req: Request, res: Response, next: NextFunction) {
    const user = req.user as UserServer;

    const wishes = await FeatureWish.find({ isAllowed: false, createdBy: user._id }).exec();

    const response = wishes.map(wish => {
        const obj = (wish as any).toObject ? (wish as any).toObject() : { ...wish };
        return {
            ...obj,
            likes: obj.likedBy?.length || 0,
            likedBy: undefined,
        };
    });

    res.send(response);
}