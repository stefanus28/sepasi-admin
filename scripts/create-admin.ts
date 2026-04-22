/**
 * Script untuk membuat akun admin pertama.
 * Jalankan dengan: npx ts-node -r tsconfig-paths/register scripts/create-admin.ts
 * 
 * WAJIB set env variable dulu di .env.local:
 *   ADMIN_USERNAME=username_kamu
 *   ADMIN_PASSWORD=password_kamu
 */
import { prisma } from "@/lib/prisma"
import { encrypt } from "@/lib/encryption"

async function main() {
  // FIX: Ambil credentials dari env variable, bukan hardcode
  const username = process.env.ADMIN_USERNAME
  const plainPassword = process.env.ADMIN_PASSWORD

  if (!username || !plainPassword) {
    console.error("❌ Set ADMIN_USERNAME dan ADMIN_PASSWORD di .env.local sebelum menjalankan script ini")
    process.exit(1)
  }

  // Cek apakah user sudah ada
  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) {
    console.log(`⚠️  User "${username}" sudah ada. Tidak ada yang dibuat.`)
    process.exit(0)
  }

  const encryptedPassword = encrypt(plainPassword)
  const user = await prisma.user.create({
    data: { username, password: encryptedPassword },
  })

  console.log("✅ Admin user berhasil dibuat:", { id: user.id, username: user.username })
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1) })
  .finally(() => prisma.$disconnect())
