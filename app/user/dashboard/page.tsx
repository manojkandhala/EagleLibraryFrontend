"use client"

import { useUserStats } from "@/hooks/useQueries"
import { Activity, CheckCircle, Clock, ImageIcon, RefreshCcw, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface UserStats {
  total_processed: number
  total_processing: number
  in_progress: number
  completed: number
}

export default function UserDashboard() {
  const { data: stats, isLoading, error, refetch, isRefetching } = useUserStats()

  if (isLoading) {
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

  const getCompletionRate = () => {
    const total = stats.total_processed
    return total > 0 ? Math.round((stats.completed / total) * 100) : 0
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent animate-gradient">
            Your Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Track your image processing activities and progress
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="gap-2 transition-all hover:shadow-md"
        >
          <RefreshCcw className={cn("h-4 w-4", isRefetching && "animate-spin")} />
          Refresh Now
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <Activity className="h-4 w-4" />
          <span>Error loading statistics. Please try again.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50/50 via-white to-white hover:from-blue-50 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-blue-600 transition-colors">
              Total Processed
            </CardTitle>
            <ImageIcon className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.total_processed.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  All Time
                </p>
              </div>
              <div className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full group-hover:bg-blue-200 transition-colors">
                Total
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50/50 via-white to-white hover:from-purple-50 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-purple-600 transition-colors">
              Processing
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-500 group-hover:scale-110 transition-transform duration-300" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.total_processing.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  In Queue
                </p>
              </div>
              <div className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full group-hover:bg-purple-200 transition-colors">
                Active
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50/50 via-white to-white hover:from-amber-50 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-amber-600 transition-colors">
              In Progress
            </CardTitle>
            <Activity className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform duration-300" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-amber-600">
                  {stats.in_progress.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Processing Now
                </p>
              </div>
              <div className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full group-hover:bg-amber-200 transition-colors">
                Current
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50/50 via-white to-white hover:from-green-50 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-green-600 transition-colors">
              Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">
                  {stats.completed.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  {getCompletionRate()}% Rate
                </div>
              </div>
              <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full group-hover:bg-green-200 transition-colors">
                Success
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

