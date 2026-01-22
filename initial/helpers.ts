import { promises as fs } from "fs";
import * as path from "path";

async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function saveFile(filePath: string, content: string): Promise<void> {
    const dir = path.dirname(filePath);

    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(filePath, content, "utf-8");
}

export async function createFile(filePath: string, fileNameInMessage: string, content: string) {
    if (await fileExists(filePath)) {
        console.log(fileNameInMessage + " already exists. Skipping.")
        return;
    }

    try {
        await saveFile(filePath, content);
        console.log(fileNameInMessage + " has successfully been created.")
    } catch (error) {
        throw (new Error(fileNameInMessage + " could not get created. Aborting."));
    }
}