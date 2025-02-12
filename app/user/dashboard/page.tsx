"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UserStats {
  total_processed: number
  in_progress: number
  completed: number
  user: {
    id: number
    email: string
    username: string
    role: string
    is_active: boolean
    created_at: string
  }
}

export default function UserDashboard() {
  const [stats, setStats] = useState<UserStats | null>(null)

  useEffect(() => {
    fetchUserStats()
  }, [])

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/my-stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        console.error("Failed to fetch user stats")
      }
    } catch (error) {
      console.error("Error fetching user stats:", error)
    }
  }

  if (!stats) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.total_processed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.in_progress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.completed}</p>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Username:</strong> {stats.user.username}
          </p>
          <p>
            <strong>Email:</strong> {stats.user.email}
          </p>
          <p>
            <strong>Role:</strong> {stats.user.role}
          </p>
          <p>
            <strong>Account Created:</strong> {new Date(stats.user.created_at).toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

