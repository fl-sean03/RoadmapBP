import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import { Home } from "lucide-react"

export const metadata: Metadata = {
  title: "Admin Dashboard - RoadmapBP",
  description: "Admin dashboard for RoadmapBP",
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <Home className="h-5 w-5 mr-2" />
              <span>Home</span>
            </Link>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <Link href="/admin" className="font-medium text-gray-900 dark:text-white">
              Admin Dashboard
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
} 