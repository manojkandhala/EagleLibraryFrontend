"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useQueryClient } from "@tanstack/react-query";

export default function Navbar() {
  const router = useRouter()
  const queryClient = useQueryClient();

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("refresh_token")
    queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    router.push("/")
  }

  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/admin/dashboard" className="text-xl font-bold">
              Eagle Library Admin
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/admin/dashboard" className="hover:bg-gray-700 px-3 py-2 rounded-md">
                Dashboard
              </Link>
              <Link href="/admin/users" className="hover:bg-gray-700 px-3 py-2 rounded-md">
                Users
              </Link>
              <Link href="/admin/gallery" className="hover:bg-gray-700 px-3 py-2 rounded-md">
                Gallery
              </Link>
            </div>
          </div>
          <Button onClick={handleLogout} variant="ghost">
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}
