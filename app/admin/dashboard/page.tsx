"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle } from "lucide-react"

interface User {
  id: number
  email: string
  username: string
  role: "admin" | "user"
  created_at: string
  is_active: boolean
}

interface UserStat {
  total_processed: number
  total_processing: number
  in_progress: number
  completed: number
  user: User
}

interface ProcessingOverview {
  total_images: number
  total_processing: number
  total_completed: number
  user_stats: UserStat[]
  recent_activities: Array<{
    image_id: number
    user_id: number
    action: string
    timestamp: string
  }>
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<ProcessingOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchOverview()
  }, [])

  const fetchOverview = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/processing-overview`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch overview")
      
      const data = await response.json()
      console.log('Dashboard data:', data) // Debug log
      setOverview(data)
      setError("")
    } catch (err) {
      setError("Error loading dashboard data. Please try again.")
      console.error("Error fetching overview:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!overview) {
    return (
      <div className="flex justify-center items-center min-h-[400px] text-muted-foreground">
        No data available
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Images</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{overview.total_images}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{overview.total_processing}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{overview.total_completed}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Stats */}
        <Card>
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Processed</TableHead>
                    <TableHead>In Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.user_stats.map((stat) => (
                    <TableRow key={stat.user.id}>
                      <TableCell>{stat.user.username}</TableCell>
                      <TableCell className="capitalize">{stat.user.role}</TableCell>
                      <TableCell>{stat.total_processed}</TableCell>
                      <TableCell>{stat.in_progress}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image ID</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.recent_activities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        No recent activities
                      </TableCell>
                    </TableRow>
                  ) : (
                    overview.recent_activities.map((activity, index) => (
                      <TableRow key={index}>
                        <TableCell>{activity.image_id}</TableCell>
                        <TableCell>{activity.user_id}</TableCell>
                        <TableCell className="capitalize">{activity.action}</TableCell>
                        <TableCell>
                          {new Date(activity.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

