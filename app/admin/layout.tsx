import type React from "react"
import Navbar from "@/components/Navbar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto py-6 px-4">{children}</main>
    </div>
  )
}

