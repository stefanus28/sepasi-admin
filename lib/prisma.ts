// File: lib/prisma.ts

import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

// Gunakan prisma global agar tidak membuat instance baru tiap reload (hot reload di dev)
export const prisma = global.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
