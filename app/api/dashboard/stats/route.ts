import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: {
        category: true,
      },
    })

    const totalProducts = products.length
    const uniqueCategories = new Set(
  products.map((p: { category: string }) => p.category)
).size

    // ✅ Ambil jumlah klik dari database
    const totalClicks = await prisma.click.count()

    return NextResponse.json({
      totalProducts,
      categories: uniqueCategories,
      amazonClicks: totalClicks,
    })
  } catch (error) {
    console.error("Failed to load stats:", error)
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 })
  }
}
