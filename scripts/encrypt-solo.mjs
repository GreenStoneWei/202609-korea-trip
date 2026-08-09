import { webcrypto } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import process from "node:process";

const sourcePath = new URL("../.private/solo-trip.json", import.meta.url);
const outputPath = new URL("../solo-trip.enc.json", import.meta.url);
const iterations = 600_000;
const minimumPasswordLength = 12;
const encoder = new TextEncoder();

function readSecret(label) {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY) {
      reject(new Error("請在互動式終端機執行，避免密碼出現在指令或 shell history。"));
      return;
    }

    let value = "";
    const stdin = process.stdin;
    const cleanup = () => {
      stdin.off("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
      process.stdout.write("\n");
    };
    const onData = chunk => {
      for (const character of chunk) {
        if (character === "\u0003") {
          cleanup();
          reject(new Error("已取消。"));
          return;
        }
        if (character === "\r" || character === "\n") {
          cleanup();
          resolve(value);
          return;
        }
        if (character === "\u007f") {
          if (value) {
            value = value.slice(0, -1);
            process.stdout.write("\b \b");
          }
          continue;
        }
        if (character >= " ") {
          value += character;
          process.stdout.write("•");
        }
      }
    };

    process.stdout.write(label);
    stdin.setEncoding("utf8");
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on("data", onData);
  });
}

function toBase64(bytes) {
  return Buffer.from(bytes).toString("base64");
}

async function deriveKey(password, salt) {
  const material = await webcrypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return webcrypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );
}

async function main() {
  const source = await readFile(sourcePath, "utf8");
  const trip = JSON.parse(source);
  if (trip.version !== 1 || !Array.isArray(trip.days)) {
    throw new Error("私人行程必須是 version 1，並包含 days 陣列。請參考 docs/solo-trip.example.json。 ");
  }

  const password = await readSecret("私人行程密碼：");
  if (password.length < minimumPasswordLength) {
    throw new Error(`密碼至少需要 ${minimumPasswordLength} 個字元，建議使用 5 個以上隨機單字。`);
  }
  const confirmation = await readSecret("再次輸入密碼：");
  if (password !== confirmation) throw new Error("兩次輸入的密碼不同。 ");

  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ciphertext = await webcrypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(JSON.stringify(trip)),
  );
  const payload = {
    version: 1,
    configured: true,
    kdf: { name: "PBKDF2", hash: "SHA-256", iterations },
    cipher: { name: "AES-GCM", length: 256 },
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(ciphertext)),
  };
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log("已更新 solo-trip.enc.json；請只提交加密檔，不要提交 .private/solo-trip.json。 ");
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
