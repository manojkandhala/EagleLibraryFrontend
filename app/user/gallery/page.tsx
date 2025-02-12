"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useInView } from "react-intersection-observer"

interface ImageObject {
  id: number
  title: string
  artist: string
  urls: {
    original: string
    thumbnails: {
      medium: string
    }
  }
}

export default function UserGallery() {
  const [images, setImages] = useState<ImageObject[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState("")
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  })

  const fetchImages = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/available-images?page=${page}&page_size=12`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      if (!response.ok) throw new Error("Failed to fetch images")
      
      const data = await response.json()
      setImages((prev) => [...prev, ...data.items])
      setHasMore(data.has_next)
      setPage((p) => p + 1)
      setError("")
    } catch (err) {
      setError("Error loading images. Please try again.")
      console.error("Error fetching images:", err)
    } finally {
      setLoading(false)
    }
  }, [page, loading, hasMore])

  useEffect(() => {
    if (inView) {
      fetchImages()
    }
  }, [inView, fetchImages])

  const handleDownload = (imageUrl: string, imageName: string) => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = imageName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleStartProcessing = async (imageId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/images/${imageId}/process-request`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      if (!response.ok) throw new Error("Failed to start processing")
      
      // Remove the processed image from the list
      setImages((prev) => prev.filter((img) => img.id !== imageId))
    } catch (err) {
      setError("Error starting image processing. Please try again.")
      console.error("Error starting processing:", err)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Gallery</h1>
      
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="relative aspect-video mb-4">
                <Image
                  src={image.urls.thumbnails.medium}
                  alt={image.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false}
                  loading="lazy"
                />
              </div>
              <h2 className="text-lg font-semibold line-clamp-1">{image.title}</h2>
              <p className="text-sm text-muted-foreground line-clamp-1">{image.artist}</p>
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={() => handleDownload(image.urls.original, `${image.title}.jpg`)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Download
                </Button>
                <Button
                  onClick={() => handleStartProcessing(image.id)}
                  size="sm"
                  className="flex-1"
                >
                  Start Processing
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Infinite scroll trigger */}
      <div ref={ref} className="h-10">
        {loading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </div>
  )
}

