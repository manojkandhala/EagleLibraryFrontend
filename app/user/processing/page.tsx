"use client"

import { useState } from "react"
import { useUserProcessing } from "@/hooks/useQueries"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, ArrowUpRight, ImageIcon, Loader2, RefreshCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProcessingImage {
  id: number
  title: string
  status: string
  preview_url: string | null
  created_at: string
  updated_at: string
}

export default function ProcessingPage() {
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState<ProcessingImage | null>(null)
  const { data, isLoading, error, refetch, isRefetching } = useUserProcessing()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const images = data?.items || []

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent animate-gradient">
            Processing Images
          </h1>
          <p className="text-muted-foreground text-sm">
            Monitor and manage your image processing queue
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="gap-2 transition-all hover:shadow-md"
          >
            <RefreshCcw className={cn("h-4 w-4", isRefetching && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push("/user/gallery")}
            className="gap-2 transition-all hover:shadow-md"
          >
            <ArrowUpRight className="h-4 w-4" />
            Go to Gallery
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <AlertCircle className="h-4 w-4" />
          <span>Error loading processing images. Please try again.</span>
        </div>
      )}

      {images.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <ImageIcon className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl font-semibold mb-2">No Processing Images</CardTitle>
            <CardDescription className="max-w-sm mb-4">
              You don't have any images being processed at the moment. Visit your gallery to start processing new images.
            </CardDescription>
            <Button
              variant="default"
              onClick={() => router.push("/user/gallery")}
              className="gap-2"
            >
              <ArrowUpRight className="h-4 w-4" />
              Go to Gallery
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image: ProcessingImage) => (
            <Card
              key={image.id}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
                    {image.title}
                  </CardTitle>
                  <div className={cn(
                    "px-2 py-1 rounded-full text-xs capitalize transition-colors",
                    image.status === "processing" 
                      ? "bg-amber-100 text-amber-700 group-hover:bg-amber-200"
                      : image.status === "completed"
                      ? "bg-green-100 text-green-700 group-hover:bg-green-200"
                      : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
                  )}>
                    {image.status}
                  </div>
                </div>
                <CardDescription className="text-sm text-muted-foreground mt-1">
                  Started {new Date(image.created_at).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {image.preview_url ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={image.preview_url}
                      alt={image.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center aspect-video rounded-lg bg-muted/50">
                    <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedImage?.title}</span>
              <span className={cn(
                "px-2 py-1 rounded-full text-xs capitalize",
                selectedImage?.status === "processing" 
                  ? "bg-amber-100 text-amber-700"
                  : selectedImage?.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-700"
              )}>
                {selectedImage?.status}
              </span>
            </DialogTitle>
          </DialogHeader>
          {selectedImage?.preview_url ? (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <Image
                src={selectedImage.preview_url}
                alt={selectedImage.title}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center aspect-video rounded-lg bg-muted">
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <strong>Started:</strong> {new Date(selectedImage?.created_at || "").toLocaleString()}
            </div>
            <div>
              <strong>Last Updated:</strong> {new Date(selectedImage?.updated_at || "").toLocaleString()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

