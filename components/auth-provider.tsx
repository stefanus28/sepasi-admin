"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
  username: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // FIX BUG #3 & #4: Cek session dari server, bukan localStorage
    const checkSession = async () => {
      try {
        const res = await fetch("/api/session")
        const data = await res.json()
        if (data.loggedIn && data.username) {
          setUser({ username: data.username })
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    checkSession()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      const isAuthPage = pathname === "/login"
      const isProtectedRoute = !isAuthPage && pathname !== "/"
      if (!user && isProtectedRoute) {
        router.push("/login")
      } else if (user && isAuthPage) {
        router.push("/dashboard")
      }
    }
  }, [user, pathname, isLoading, router])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      let data: { success?: boolean; message?: string } | null = null
      try {
        data = await res.json()
      } catch {
        console.error("Gagal parse JSON dari /api/login")
        return false
      }

      if (res.ok && data?.success) {
        setUser({ username })
        return true
      } else {
        console.warn("Login gagal:", data?.message || "Unknown error")
        return false
      }
    } catch (error) {
      console.error("Terjadi error saat login:", error)
      return false
    }
  }

  // FIX BUG #3: Logout sekarang memanggil /api/logout untuk destroy iron-session cookie
  const logout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" })
    } catch (e) {
      console.error("Logout API error:", e)
    }
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
