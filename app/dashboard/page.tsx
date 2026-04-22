"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import AdminLayout from "@/components/admin-layout"

interface Product {
  id: number
  name: string
  category: string
  price: number
  amazonLink: string
  description: string
  image?: string
}

const COLORS = ["#00796B", "#004D40", "#26A69A", "#4DB6AC", "#80CBC4", "#B2DFDB", "#E0F2F1"]

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState({
    totalProducts: 0,
    categories: 0,
    amazonClicks: 0,
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        // FIX BUG #5: Gunakan relative URL, bukan hardcode localhost:3000
        const [productRes, clickRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/clicks"),
        ])

        const productsData = await productRes.json()
        const clickData = await clickRes.json()

        setProducts(productsData)

        const categorySet = new Set(productsData.map((p: Product) => p.category))
        setStats({
          totalProducts: productsData.length,
          categories: categorySet.size,
          amazonClicks: clickData.total ?? 0,
        })
      } catch (error) {
        console.error("Failed to load dashboard data", error)
      }
    }

    loadData()
  }, [])

  const categoryData = products.reduce(
    (acc, product) => {
      const existing = acc.find((item) => item.category === product.category)
      if (existing) {
        existing.count += 1
      } else {
        acc.push({ category: product.category, count: 1 })
      }
      return acc
    },
    [] as { category: string; count: number }[],
  )

  const chartConfig = {
    count: {
      label: "Products",
      color: "#00796B",
    },
  }

  return (
    <AdminLayout>
      <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Sepasi Admin</h1>
          <p className="mt-2 text-gray-600">Manage your affiliate products and track performance</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <div className="h-4 w-4 text-teal-600">📦</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">Active products in catalog</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <div className="h-4 w-4 text-teal-600">🏷️</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600">{stats.categories}</div>
              <p className="text-xs text-muted-foreground">Product categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Amazon Clicks</CardTitle>
              <div className="h-4 w-4 text-teal-600">🔗</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600">{stats.amazonClicks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total affiliate clicks</p>
            </CardContent>
          </Card>
        </div>

        {categoryData.length > 0 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 overflow-x-auto pb-2">
            <Card className="min-w-[320px]">
              <CardHeader>
                <CardTitle>Products by Category</CardTitle>
                <CardDescription>Distribution of products across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percent }) =>
                          percent !== undefined ? `${category} ${(percent * 100).toFixed(0)}%` : category
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="min-w-[320px]">
              <CardHeader>
                <CardTitle>Category Overview</CardTitle>
                <CardDescription>Number of products per category</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <XAxis
                        dataKey="category"
                        tick={{ fontSize: 14 }}
                        interval={0}
                        angle={-30}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="#00796B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {categoryData.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600 text-center mb-4">
                Start by uploading your first product to see analytics and charts here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
