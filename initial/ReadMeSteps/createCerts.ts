import { createFile, getRootDir } from "../helpers.ts";

const rootDir = getRootDir();
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