import { NextRequest, NextResponse } from "next/server"
import { getIronSession } from "iron-session"
import { sessionOptions, SessionData } from "@/lib/session"

export async function GET(req: NextRequest) {
  // FIX: Jangan pakai NextResponse.next() di dalam API route handler
  // NextResponse.next() hanya untuk middleware. Di sini harus pakai NextResponse.json()
  // agar iron-session bisa baca cookie dengan benar.
  const res = new NextResponse()
  const session = await getIronSession<SessionData>(req, res, sessionOptions)

  if (session.username) {
    return NextResponse.json({ loggedIn: true, username: session.username })
  }
  return NextResponse.json({ loggedIn: false })
}
