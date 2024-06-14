import crypto from "crypto";
import config from "./config.js";
import chalk from "chalk";

const { secret_key, secret_iv, ecnryption_method } = config;

if (!secret_key || !secret_iv || !ecnryption_method) {
  throw new Error("secretKey, secretIV, and ecnryptionMethod are required");
} else {
  console.log(chalk.green("Konfigurasi AES ditemukan: menggunakan metode enkripsi", ecnryption_method));
}

// Generate secret hash with crypto to use for encryption
const key = crypto
  .createHash("sha512")
  .update(secret_key)
  .digest("hex")
  .substring(0, 32);
const encryptionIV = crypto
  .createHash("sha512")
  .update(secret_iv)
  .digest("hex")
  .substring(0, 16);

console.log(chalk.green("Kunci dan IV untuk enkripsi telah berhasil dihasilkan."));

// Encrypt data
export function encryptData(data) {
  const cipher = crypto.createCipheriv(ecnryption_method, key, encryptionIV);
  const encryptedData = Buffer.from(
    cipher.update(data, "utf8", "hex") + cipher.final("hex")
  ).toString("base64"); // Encrypts data and converts to hex and base64
  console.log(chalk.green("Data telah dienkripsi."));
  return encryptedData;
}

// Decrypt data
export function decryptData(encryptedData) {
  const buff = Buffer.from(encryptedData, "base64");
  // Converts encrypted data to utf8
  const decipher = crypto.createDecipheriv(
    ecnryption_method,
    key,
    encryptionIV
  );
  const decryptedData = (
    decipher.update(buff.toString("utf8"), "hex", "utf8") +
    decipher.final("utf8")
  ); // Decrypts data and converts to utf8
  console.log(chalk.green("Data telah didekripsi."));
  return decryptedData;
}
