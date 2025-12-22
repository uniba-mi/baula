import fs from "fs";

/**
 * Reads a JSON file and parses it into a JS object.
 * @param {string} filePath - The path to the JSON file to be read.
 * @returns {Promise<T>} - Promise with parsed JSON data as type T.
 * @template T - The type of the expected data structure that the JSON file contains.
 */
export async function readJsonFile<T>(filePath: string): Promise<T> {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            try {
                const jsonData = JSON.parse(data.toString()) as T;
                resolve(jsonData);
            } catch (parseError) {
                reject(parseError);
            }
        });
    });
}