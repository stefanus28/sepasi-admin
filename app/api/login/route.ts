import { NextRequest, NextResponse } from "next/server"
import { getIronSession } from "iron-session"
import { prisma } from "@/lib/prisma"
import { sessionOptions, SessionData } from "@/lib/session"
import { decrypt } from "@/lib/encryption"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, password } = body

    // Validasi input kosong
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username dan password wajib diisi." },
        { status: 400 }
      )
    }

    // Cari user di database
    const user = await prisma.user.findUnique({
      where: { username },
    })

    // Jika user tidak ditemukan
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Username tidak ditemukan." },
        { status: 401 }
      )
    }

    // Bandingkan password
    const decryptedPassword = decrypt(user.password)
    if (decryptedPassword !== password) {
      return NextResponse.json(
        { success: false, message: "Password salah." },
        { status: 401 }
      )
    }

    // Simpan ke session
    const res = NextResponse.json({ success: true })
    const session = await getIronSession<SessionData>(req, res, sessionOptions)
    session.username = user.username
    await session.save()

    return res
  } catch (err) {
    console.error("Login error:", err)
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan di server." },
      { status: 500 }
    )
  }
}
