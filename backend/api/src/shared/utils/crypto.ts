import crypto from "crypto";

// AES-256-GCM Helpers
const keyB64 = process.env.SESSION_ENC_KEY;
if (!keyB64) {
  throw new Error("SESSION_ENC_KEY fehlt");
}

const KEY = Buffer.from(keyB64, "base64");
if (KEY.length !== 32) {
  throw new Error("SESSION_ENC_KEY muss 32 Byte (Base64) enthalten");
}
const ALG = "aes-256-gcm";

export function encrypt(text: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALG, KEY, iv);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return JSON.stringify({
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    ct: enc.toString("base64"),
  });
}

export function decrypt(payload: string) {
  try {
    const data = JSON.parse(payload);
    const decipher = crypto.createDecipheriv(ALG, KEY, Buffer.from(data.iv, "base64"));
    decipher.setAuthTag(Buffer.from(data.tag, "base64"));
    const dec = Buffer.concat([
      decipher.update(Buffer.from(data.ct, "base64")),
      decipher.final(),
    ]);
    return dec.toString("utf8");
  } catch {
    return null;
  }
}