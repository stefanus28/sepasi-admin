// lib/cors.ts
import { NextResponse } from "next/server"

// Gunakan generic agar bisa menerima context opsional (untuk route dinamis)
export function withCors<T = any>(
  handler: (req: Request, context?: T) => Promise<NextResponse>
) {
  return async (req: Request, context?: T) => {
    // Tangani preflight
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      })
    }

    const res = await handler(req, context)

    res.headers.set("Access-Control-Allow-Origin", "*")
    res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
    res.headers.set("Access-Control-Allow-Headers", "Content-Type")

    return res
  }
}
