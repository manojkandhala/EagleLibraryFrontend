"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ProcessingOverview {
  total_images: number
  total_processing: number
  total_completed: number
  user_stats: {
    user_id: number
    username: string
    total_processed: number
    in_progress: number
  }[]
  recent_activities: {
    image_id: number
    user_id: number
    action: string
    timestamp: string
  }[]
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<ProcessingOverview | null>(null)

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/processing-overview`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setOverview(data)
        } else {
          console.error("Failed to fetch overview")
        }
      } catch (error) {
        console.error("Error fetching overview:", error)
      }
    }

    fetchOverview()
  }, [])

  if (!overview) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
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
      <h2 className="text-2xl font-bold mt-8 mb-4">User Stats</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Total Processed
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                In Progress
              </th>
            </tr>
          </thead>
          <tbody>
            {overview.user_stats.map((user) => (
              <tr key={user.user_id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.total_processed}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.in_progress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

