import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET single product
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    })
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })

    const res = NextResponse.json(product)
    res.headers.set("Access-Control-Allow-Origin", "*")
    return res
  } catch (err) {
    console.error("Error fetching product:", err)
    const res = NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    res.headers.set("Access-Control-Allow-Origin", "*")
    return res
  }
}

// PUT — update product (FIX BUG #2: handler ini sebelumnya tidak ada)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })

  try {
    const body = await req.json()
    const { name, category, price, amazonLink, description } = body

    if (!name || !category || !price || !amazonLink) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        category,
        price: parseFloat(price),
        amazonLink,
        description: description ?? "",
      },
      include: { images: true },
    })

    const res = NextResponse.json(updated)
    res.headers.set("Access-Control-Allow-Origin", "*")
    return res
  } catch (err) {
    console.error("Error updating product:", err)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}

// DELETE — hapus product + relasi images & clicks (FIX BUG #2)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })

  try {
    // Hapus relasi dulu sebelum hapus product (foreign key constraint)
    await prisma.productImage.deleteMany({ where: { productId: id } })
    await prisma.click.deleteMany({ where: { productId: id } })
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Error deleting product:", err)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}

// OPTIONS — preflight CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
