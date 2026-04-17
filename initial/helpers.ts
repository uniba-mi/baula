import { promises as fs } from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

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

export function getRootDir(): string {
    const currentFile = fileURLToPath(import.meta.url);
    let currentFileDir = path.dirname(currentFile);
    let rootDir = null;

    while(!rootDir) {
        const pieces = currentFileDir.split("/");
        if (pieces.length <= 2) throw new Error("Could not identify root directory of baula.");
        if (pieces[pieces.length - 1] === "baula") {
            rootDir = currentFileDir;
        }

        currentFileDir = path.resolve(currentFileDir, "..");
    }
    
    return rootDir;
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