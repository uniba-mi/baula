import { PrismaClient } from "@prisma/client";

/**
 * Single shared PrismaClient for the whole process.
 */
export const prisma = new PrismaClient();