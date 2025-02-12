"use client"

import { useState, useCallback } from "react"
import { useUserProcessing } from "@/hooks/useQueries"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertCircle, Download, ImageIcon, Loader2, Upload, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface ProcessingImage {
  id: number
  title: string
  artist: string
  museum?: string
  tags: string[]
  orientation: "horizontal" | "vertical" | "other"
  created_at: string
  updated_at: string
  urls: {
    original: string
    processed?: string
    thumbnails: {
      small: string
      medium: string
      large: string
      xlarge: string
    }
  }
  is_processing: boolean
  processor_id?: number
}

export default function ProcessingPage() {
  const [uploadingId, setUploadingId] = useState<number | null>(null)
  const { data, isLoading, error, refetch } = useUserProcessing()
  const router = useRouter()

  const handleDownload = (imageUrl: string, imageId: number) => {
    const downloadLink = document.createElement('a')
    downloadLink.href = imageUrl
    downloadLink.download = `image-${imageId}`
    downloadLink.click()
  }

  const handleUpload = async (imageId: number) => {
    setUploadingId(imageId)
    try {
      // Create file input and trigger click
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.accept = 'image/*'
      fileInput.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/images/${imageId}/upload-processed`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: formData,
          }
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || "Failed to upload processed image")
        }

        // Refetch to update the list
        refetch()
      }
      fileInput.click()
    } catch (err) {
      console.error("Error uploading processed image:", err)
      alert(err instanceof Error ? err.message : "Failed to upload processed image")
    } finally {
      setUploadingId(null)
    }
  }

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            Processing Images
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your assigned images for processing
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
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
              You don't have any images being processed at the moment. Visit the gallery to discover and start processing new images.
            </CardDescription>
            <Button
              onClick={() => router.push("/user/gallery")}
              className="gap-2"
            >
              <ArrowUpRight className="h-4 w-4" />
              Go to Gallery
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {images.map((image: ProcessingImage) => (
            <Card key={image.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative aspect-video w-full md:w-1/3">
                    <Image
                      src={image.urls.thumbnails.medium}
                      alt={image.title}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold">{image.title}</h2>
                      <p className="text-muted-foreground">
                        by {image.artist}
                        {image.museum && ` • ${image.museum}`}
                      </p>
                    </div>
                    {image.tags && image.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {image.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-4">
                      <Button
                        onClick={() => handleDownload(image.urls.original, image.id)}
                        variant="outline"
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Original
                      </Button>
                      <Button
                        onClick={() => handleUpload(image.id)}
                        disabled={uploadingId === image.id}
                        className="gap-2"
                      >
                        {uploadingId === image.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Upload Processed
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

