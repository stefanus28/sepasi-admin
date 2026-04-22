// app/api/clicks/route.ts

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Handler untuk mencatat klik (POST)
export async function POST(req: Request) {
  try {
    const { productId } = await req.json()

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 })
    }

    await prisma.click.create({
      data: { productId: Number(productId) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error recording click:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Handler untuk mendapatkan total klik (GET)
export async function GET() {
  try {
    const total = await prisma.click.count()
    return NextResponse.json({ total })
  } catch (error) {
    console.error("Error fetching click count:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
