"use client"

import { useState, useEffect } from "react"
import { Activity, CheckCircle, Clock } from "lucide-react"

interface UserStats {
  total_processed: number
  total_processing: number
  in_progress: number
  completed: number
}

export default function UserDashboard() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/my-stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch stats")
      
      const data = await response.json()
      setStats(data)
      setError("")
    } catch (err) {
      setError("Error loading statistics. Please try again.")
      console.error("Error fetching stats:", err)
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

  if (!stats) {
    return (
      <div className="flex justify-center items-center min-h-[400px] text-muted-foreground">
        No data available
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-blue-900">Total Processed</h3>
            <Activity className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-4xl font-bold text-blue-600">{stats.total_processed}</p>
        </div>
        <div className="rounded-xl border bg-gradient-to-br from-purple-50 to-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-purple-900">Total Processing</h3>
            <Activity className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-4xl font-bold text-purple-600">{stats.total_processing}</p>
        </div>
        <div className="rounded-xl border bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-amber-900">In Progress</h3>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-4xl font-bold text-amber-600">{stats.in_progress}</p>
        </div>
        <div className="rounded-xl border bg-gradient-to-br from-green-50 to-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-green-900">Completed</h3>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-4xl font-bold text-green-600">{stats.completed}</p>
        </div>
      </div>
    </div>
  )
}

