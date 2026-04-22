import crypto from "crypto"

const ALGORITHM = "aes-256-cbc"

// FIX BUG #10: Hapus fallback hardcoded key — wajibkan via env variable
function getSecretKey(): string {
  const key = process.env.SECRET_KEY
  if (!key || key.length !== 32) {
    throw new Error("SECRET_KEY environment variable harus diisi dengan tepat 32 karakter")
  }
  return key
}

export function encrypt(text: string): string {
  const SECRET_KEY = getSecretKey()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv)
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  return iv.toString("hex") + ":" + encrypted
}

export function decrypt(encrypted: string): string {
  const SECRET_KEY = getSecretKey()
  const [ivHex, encryptedText] = encrypted.split(":")
  const iv = Buffer.from(ivHex, "hex")
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv)
  let decrypted = decipher.update(encryptedText, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}
