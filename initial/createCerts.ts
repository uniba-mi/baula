import { createFile } from "./helpers.ts";
import * as path from "path";
import { fileURLToPath } from "url";

const currentFile = fileURLToPath(import.meta.url);
const currentFileDir = path.dirname(currentFile);
const rootDir = path.resolve(currentFileDir, "..");
const certDir = rootDir + "/backend/api/src/certs/";

const certPaths = [
    certDir + "idp_cert.pem",
    certDir + "sp_cert.pem",
    certDir + "sp_key.pem"
]

export async function createCertFiles() {
    const content = "test";

    for (const certPath of certPaths) {
        await createFile(certPath, certPath, content);
    }
}