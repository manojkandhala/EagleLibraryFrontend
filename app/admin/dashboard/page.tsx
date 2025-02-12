"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Activity, AlertCircle, Users, Image as ImageIcon, CheckCircle, Clock, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <span className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </span>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Images</CardTitle>
            <ImageIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-600">{overview.total_images}</div>
              <div className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                All Time
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Processing</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-purple-600">{overview.total_processing}</div>
              <div className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                Active
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">{overview.total_completed}</div>
              <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                Success
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
            <Users className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-amber-600">
                {overview.user_stats.filter(stat => stat.in_progress > 0).length}
              </div>
              <div className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">
                Current
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">User Statistics</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Processed</TableHead>
                    <TableHead>In Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.user_stats.map((stat) => (
                    <TableRow key={stat.user.id} className="group">
                      <TableCell className="font-medium">{stat.user.username}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs capitalize",
                          stat.user.role === "admin" 
                            ? "bg-blue-100 text-blue-700" 
                            : "bg-slate-100 text-slate-700"
                        )}>
                          {stat.user.role}
                        </span>
                      </TableCell>
                      <TableCell>{stat.total_processed}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {stat.in_progress}
                          {stat.in_progress > 0 && (
                            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Image ID</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.recent_activities.length === 0 ? (
                    <TableRow>
                      <TableCell 
                        colSpan={4} 
                        className="text-center py-4 text-muted-foreground"
                      >
                        No recent activities
                      </TableCell>
                    </TableRow>
                  ) : (
                    overview.recent_activities.map((activity, index) => (
                      <TableRow key={index} className="group">
                        <TableCell className="font-medium">#{activity.image_id}</TableCell>
                        <TableCell>#{activity.user_id}</TableCell>
                        <TableCell>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs capitalize",
                            activity.action.includes("start") 
                              ? "bg-amber-100 text-amber-700"
                              : activity.action.includes("complete")
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-700"
                          )}>
                            {activity.action}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
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

