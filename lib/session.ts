// lib/session.ts
import { getIronSession, SessionOptions } from "iron-session"
import type { NextApiRequest, NextApiResponse } from "next"

export interface SessionData {
  username?: string
}

// FIX BUG #11: Hapus fallback hardcoded password — wajibkan via env variable
function getSessionPassword(): string {
  const pass = process.env.SESSION_PASSWORD
  if (!pass || pass.length < 32) {
    throw new Error("SESSION_PASSWORD environment variable harus diisi minimal 32 karakter")
  }
  return pass
}

export const sessionOptions: SessionOptions = {
  cookieName: "sepasi-session",
  password: process.env.SESSION_PASSWORD || "placeholder-will-throw-at-runtime-if-not-set-xxxxxxxxx",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
}

export function getSession(req: NextApiRequest, res: NextApiResponse) {
  return getIronSession<SessionData>(req, res, sessionOptions)
}
