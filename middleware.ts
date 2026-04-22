import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin")

  // FIX BUG #6: Gunakan env variable, bukan hardcode localhost
  const allowedOrigins = [
    process.env.ECOMMERCE_URL || "http://localhost:3001",
    "http://localhost:3001",
  ].filter(Boolean)

  const isAllowed = origin ? allowedOrigins.includes(origin) : false
  const response = NextResponse.next()

  if (isAllowed && origin) {
    response.headers.set("Access-Control-Allow-Origin", origin)
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.set("Access-Control-Allow-Credentials", "true")
  }

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin && isAllowed ? origin : (process.env.ECOMMERCE_URL || "http://localhost:3001"),
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
      },
    })
  }

  return response
}

export const config = {
  matcher: ["/api/:path*"],
}
