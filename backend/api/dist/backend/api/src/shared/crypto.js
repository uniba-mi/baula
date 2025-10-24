"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
const crypto_1 = __importDefault(require("crypto"));
// AES-256-GCM Helpers
const KEY = Buffer.from(process.env.SESSION_ENC_KEY ? process.env.SESSION_ENC_KEY : '', "base64");
const ALG = "aes-256-gcm";
function encrypt(text) {
    const iv = crypto_1.default.randomBytes(12);
    const cipher = crypto_1.default.createCipheriv(ALG, KEY, iv);
    const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return JSON.stringify({
        iv: iv.toString("base64"),
        tag: tag.toString("base64"),
        ct: enc.toString("base64"),
    });
}
function decrypt(payload) {
    try {
        const data = JSON.parse(payload);
        const decipher = crypto_1.default.createDecipheriv(ALG, KEY, Buffer.from(data.iv, "base64"));
        decipher.setAuthTag(Buffer.from(data.tag, "base64"));
        const dec = Buffer.concat([
            decipher.update(Buffer.from(data.ct, "base64")),
            decipher.final(),
        ]);
        return dec.toString("utf8");
    }
    catch {
        return null;
    }
}
