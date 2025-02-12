"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate fields before submission
    if (!username.trim()) {
      setError("Please enter your username")
      return
    }
    if (!password.trim()) {
      setError("Please enter your password")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username,
          password,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("token", data.access_token)
        localStorage.setItem("role", data.role)
        localStorage.setItem("refresh_token", data.refresh_token)
        router.push(data.role === "admin" ? "/admin/dashboard" : "/user/dashboard")
      } else {
        const errorData = await response.json()
        setError(errorData.detail || "Invalid credentials")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="username"
                className="focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="current-password"
                className="focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              />
            </div>
          </div>
          {error && (
            <p className="text-sm font-medium text-destructive mt-2" role="alert">
              {error}
            </p>
          )}
          <CardFooter className="flex justify-between mt-4 px-0">
            <Button
              type="submit"
              className={cn(
                "w-full transition-all",
                "hover:opacity-90 active:scale-95",
                "focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50"
              )}
              disabled={isLoading}
              aria-label={isLoading ? "Logging in..." : "Login"}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

