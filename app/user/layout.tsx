"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User } from "lucide-react"
import { useCurrentUser } from "@/hooks/useQueries"

interface UserProfile {
  id: number
  email: string
  username: string
  role: string
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: user } = useCurrentUser()

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      
      if (response.ok) {
        localStorage.removeItem("token")
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/user/dashboard",
    },
    {
      name: "Gallery",
      href: "/user/gallery",
    },
    {
      name: "Processing",
      href: "/user/processing",
    },
  ]

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/75 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 w-full">
        <div className="container mx-auto px-4">
          <div className="h-14 flex items-center">
            <Link 
              href="/user/dashboard" 
              className="font-semibold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
            >
              Eagle Library
            </Link>
            <nav className="flex items-center gap-6 ml-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary relative py-4",
                    pathname === item.href ? 
                    "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary" : 
                    "text-muted-foreground"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-4">
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-8 w-8 rounded-full hover:bg-primary/10 transition-colors"
                    >
                      <Avatar className="h-8 w-8 transition-transform hover:scale-105">
                        <AvatarFallback className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                          {getInitials(user.username)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-sm">{user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link 
                        href="/user/change-password" 
                        className="w-full cursor-pointer text-sm font-medium"
                      >
                        Change Password
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onSelect={handleLogout}
                      className="text-sm font-medium text-red-600 focus:text-red-600"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
} 