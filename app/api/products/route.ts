import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_FILE_SIZE_MB = 5

// FIX BUG C: sanitize filename — hapus spasi & karakter berbahaya
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "_") // ganti semua karakter aneh jadi underscore
    .replace(/_+/g, "_")               // collapse multiple underscores
    .toLowerCase()
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({ include: { images: true } })
    const res = NextResponse.json(products)
    res.headers.set("Access-Control-Allow-Origin", "*")
    return res
  } catch (error) {
    console.error("Failed to fetch products:", error)
    const res = NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    res.headers.set("Access-Control-Allow-Origin", "*")
    return res
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const name = formData.get("name") as string
    const category = formData.get("category") as string
    const price = parseFloat(formData.get("price") as string)
    const amazonLink = formData.get("amazonLink") as string
    // FIX BUG D: description bisa null — fallback ke string kosong agar tidak crash DB
    const description = (formData.get("description") as string) ?? ""
    const files = formData.getAll("images") as File[]

    if (!name || !category || isNaN(price) || !amazonLink) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "At least one image is required" }, { status: 400 })
    }

    const savedImagePaths: string[] = []

    for (const file of files) {
      // FIX BUG C: validasi MIME type di server (bukan hanya client)
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `File type not allowed: ${file.type}. Only JPEG, PNG, WebP, GIF.` },
          { status: 400 }
        )
      }

      // FIX BUG C: validasi ukuran file di server
      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB > MAX_FILE_SIZE_MB) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Max ${MAX_FILE_SIZE_MB}MB per image.` },
          { status: 400 }
        )
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      const uploadDir = path.join(process.cwd(), "public/uploads")
      await mkdir(uploadDir, { recursive: true })

      // FIX BUG C: sanitize nama file sebelum disimpan
      const safeFilename = `${Date.now()}-${sanitizeFilename(file.name)}`
      const filepath = path.join(uploadDir, safeFilename)

      await writeFile(filepath, buffer)
      savedImagePaths.push(`/uploads/${safeFilename}`)
    }

    const createdProduct = await prisma.product.create({
      data: {
        name,
        category,
        price,
        amazonLink,
        description,
        images: { create: savedImagePaths.map((url) => ({ url })) },
      },
      include: { images: true },
    })

    const res = NextResponse.json(createdProduct)
    res.headers.set("Access-Control-Allow-Origin", "*")
    return res
  } catch (error) {
    console.error("Failed to create product:", error)
    const res = NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    res.headers.set("Access-Control-Allow-Origin", "*")
    return res
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
