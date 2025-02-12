"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Activity, AlertCircle, Users, Image as ImageIcon, CheckCircle, Clock, ArrowUpRight, RefreshCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchOverview()
  }, [])

  const fetchOverview = async () => {
    try {
      setRefreshing(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/processing-overview`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch overview")
      
      const data = await response.json()
      setOverview(data)
      setError("")
    } catch (err) {
      setError("Error loading dashboard data. Please try again.")
      console.error("Error fetching overview:", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
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
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground text-sm">
            Monitor your system's performance and user activities
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchOverview}
          disabled={refreshing}
          className="gap-2 transition-all hover:shadow-md"
        >
          <RefreshCcw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="group hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-blue-50/50 via-white to-white hover:from-blue-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-blue-600 transition-colors">
              Total Images
            </CardTitle>
            <ImageIcon className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-600">
                {overview.total_images.toLocaleString()}
              </div>
              <div className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full group-hover:bg-blue-200 transition-colors">
                All Time
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-purple-50/50 via-white to-white hover:from-purple-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-purple-600 transition-colors">
              Processing
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-500 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-purple-600">
                {overview.total_processing.toLocaleString()}
              </div>
              <div className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full group-hover:bg-purple-200 transition-colors">
                Active
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-green-50/50 via-white to-white hover:from-green-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-green-600 transition-colors">
              Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">
                {overview.total_completed.toLocaleString()}
              </div>
              <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full group-hover:bg-green-200 transition-colors">
                Success
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-amber-50/50 via-white to-white hover:from-amber-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-amber-600 transition-colors">
              Active Users
            </CardTitle>
            <Users className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-amber-600">
                {overview.user_stats.filter(stat => stat.in_progress > 0).length}
              </div>
              <div className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full group-hover:bg-amber-200 transition-colors">
                Current
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold">User Statistics</CardTitle>
              <p className="text-sm text-muted-foreground">Overview of user processing activities</p>
            </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-muted/50">
                    <TableHead className="font-medium">User</TableHead>
                    <TableHead className="font-medium">Role</TableHead>
                    <TableHead className="font-medium">Processed</TableHead>
                    <TableHead className="font-medium">In Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.user_stats.map((stat) => (
                    <TableRow 
                      key={stat.user.id} 
                      className="group hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium">{stat.user.username}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs capitalize transition-colors",
                          stat.user.role === "admin" 
                            ? "bg-blue-100 text-blue-700 group-hover:bg-blue-200" 
                            : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
                        )}>
                          {stat.user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-primary">
                          {stat.total_processed.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-amber-600">
                            {stat.in_progress}
                          </span>
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

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
              <p className="text-sm text-muted-foreground">Latest processing actions</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-muted/50">
                    <TableHead className="font-medium">Image ID</TableHead>
                    <TableHead className="font-medium">User ID</TableHead>
                    <TableHead className="font-medium">Action</TableHead>
                    <TableHead className="font-medium">Time</TableHead>
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
                      <TableRow 
                        key={index} 
                        className="group hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">#{activity.image_id}</TableCell>
                        <TableCell>#{activity.user_id}</TableCell>
                        <TableCell>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs capitalize transition-colors",
                            activity.action.includes("start") 
                              ? "bg-amber-100 text-amber-700 group-hover:bg-amber-200"
                              : activity.action.includes("complete")
                              ? "bg-green-100 text-green-700 group-hover:bg-green-200"
                              : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
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

