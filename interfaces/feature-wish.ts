export interface FeatureWish {
    _id: string,
    createdAt: Date,
    title: string,
    description: string,
    isAllowed: boolean,
    likedBy?: string[],
    likes?: number,
    createdBy?: string,
    icon?: string,
    adminMessage?: string,
    tags?: string[],
}