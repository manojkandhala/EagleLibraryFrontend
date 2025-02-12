"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { useInView } from "react-intersection-observer"

interface ImageObject {
  id: number
  title: string
  artist: string
  museum?: string
  tags: string[]
  orientation: "horizontal" | "vertical" | "other"
  created_at: string
  updated_at: string
  is_processing: boolean
  processor_id?: number
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
}

export default function AdminGallery() {
  const [images, setImages] = useState<ImageObject[]>([])
  const [selectedImage, setSelectedImage] = useState<ImageObject | null>(null)
  const [isUpdateImageOpen, setIsUpdateImageOpen] = useState(false)
  const [updatedImage, setUpdatedImage] = useState<Partial<ImageObject>>({})
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
        `${process.env.NEXT_PUBLIC_API_URL}/images?page=${page}&page_size=12`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      if (!response.ok) throw new Error("Failed to fetch images")
      
      const data = await response.json()
      console.log('Gallery data:', data) // Debug log
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

  const handleUpdateImage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedImage) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/${selectedImage.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedImage),
      })
      if (response.ok) {
        setIsUpdateImageOpen(false)
        setUpdatedImage({})
        fetchImages()
      } else {
        console.error("Failed to update image")
      }
    } catch (error) {
      console.error("Error updating image:", error)
    }
  }

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/${imageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (!response.ok) throw new Error("Failed to delete image")
      
      setImages((prev) => prev.filter((img) => img.id !== imageId))
    } catch (err) {
      setError("Error deleting image. Please try again.")
      console.error("Error deleting image:", err)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Gallery</h1>
      
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
                  onClick={() => {
                    setSelectedImage(image)
                    setUpdatedImage(image)
                    setIsUpdateImageOpen(true)
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Update
                </Button>
                <Button 
                  onClick={() => handleDeleteImage(image.id)} 
                  variant="destructive" 
                  size="sm"
                  className="flex-1"
                >
                  Delete
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

      <Dialog open={isUpdateImageOpen} onOpenChange={setIsUpdateImageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Image</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateImage}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={updatedImage.title || ""}
                  onChange={(e) => setUpdatedImage({ ...updatedImage, title: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="artist" className="text-right">
                  Artist
                </Label>
                <Input
                  id="artist"
                  value={updatedImage.artist || ""}
                  onChange={(e) => setUpdatedImage({ ...updatedImage, artist: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="museum" className="text-right">
                  Museum
                </Label>
                <Input
                  id="museum"
                  value={updatedImage.museum || ""}
                  onChange={(e) => setUpdatedImage({ ...updatedImage, museum: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tags" className="text-right">
                  Tags
                </Label>
                <Input
                  id="tags"
                  value={updatedImage.tags?.join(", ") || ""}
                  onChange={(e) => setUpdatedImage({ ...updatedImage, tags: e.target.value.split(", ") })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="orientation" className="text-right">
                  Orientation
                </Label>
                <select
                  id="orientation"
                  value={updatedImage.orientation || ""}
                  onChange={(e) =>
                    setUpdatedImage({
                      ...updatedImage,
                      orientation: e.target.value as "horizontal" | "vertical" | "other",
                    })
                  }
                  className="col-span-3"
                >
                  <option value="horizontal">Horizontal</option>
                  <option value="vertical">Vertical</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Update Image</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

