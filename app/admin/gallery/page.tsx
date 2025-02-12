"use client"

import { useState, useEffect } from "react"
import { useAdminGallery } from "@/hooks/useQueries"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { useInView } from "react-intersection-observer"
import { useRouter } from "next/navigation"

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
  const router = useRouter()
  const [images, setImages] = useState<ImageObject[]>([])
  const [selectedImage, setSelectedImage] = useState<ImageObject | null>(null)
  const [isUpdateImageOpen, setIsUpdateImageOpen] = useState(false)
  const [updatedImage, setUpdatedImage] = useState<Partial<ImageObject>>({})
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [orientation, setOrientation] = useState<"" | "horizontal" | "vertical" | "other">("")
  const [museum, setMuseum] = useState("")
  const [sortBy, setSortBy] = useState<"created_at" | "title" | "artist">("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  })

  const params = new URLSearchParams({
    page: page.toString(),
    page_size: "12",
    sort_by: sortBy,
    sort_order: sortOrder,
  })

  if (searchTerm) params.append("search_term", searchTerm)
  if (orientation) params.append("orientation", orientation)
  if (museum) params.append("museum", museum)

  const { data, isLoading, error, refetch } = useAdminGallery(params)

  // Update images when data changes
  useEffect(() => {
    if (data?.items) {
      if (page === 1) {
        setImages(data.items)
      } else {
        setImages((prev) => [...prev, ...data.items])
      }
    }
  }, [data, page])

  // Load more when scrolling
  useEffect(() => {
    if (inView && data?.has_next && !isLoading) {
      setPage((p) => p + 1)
    }
  }, [inView, data?.has_next, isLoading])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
    setImages([])
  }, [searchTerm, orientation, museum, sortBy, sortOrder])

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
        setPage(1)
        setImages([])
        refetch()
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
      console.error("Error deleting image:", err)
    }
  }

  if (isLoading && page === 1) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Gallery</h1>
      </div>
      
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
          Error loading images. Please try again.
        </div>
      )}

      <div className="grid gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by title, artist, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <select
            value={orientation}
            onChange={(e) => setOrientation(e.target.value as any)}
            className="h-10 rounded-md border border-input bg-transparent px-3 py-1"
          >
            <option value="">All Orientations</option>
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
            <option value="other">Other</option>
          </select>
          <Input
            placeholder="Filter by museum..."
            value={museum}
            onChange={(e) => setMuseum(e.target.value)}
            className="flex-1 sm:max-w-[200px]"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-10 rounded-md border border-input bg-transparent px-3 py-1"
          >
            <option value="created_at">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="artist">Sort by Artist</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="h-10 rounded-md border border-input bg-transparent px-3 py-1"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden group">
            <CardContent className="p-4">
              <div 
                className="relative aspect-video mb-4 cursor-pointer group-hover:opacity-75 transition-opacity"
                onClick={() => router.push(`/admin/gallery/${image.id}`)}
              >
                <Image
                  src={image.urls.thumbnails.small}
                  alt={image.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false}
                  loading="lazy"
                />
              </div>
              <h2 
                className="text-lg font-semibold line-clamp-1 cursor-pointer hover:text-primary"
                onClick={() => router.push(`/admin/gallery/${image.id}`)}
              >
                {image.title}
              </h2>
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
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDeleteImage(image.id)}
                  variant="destructive"
                  size="sm"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {/* Infinite scroll trigger */}
        {data?.has_next && (
          <div ref={ref} className="col-span-full flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      <Dialog open={isUpdateImageOpen} onOpenChange={setIsUpdateImageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateImage} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={updatedImage.title || ""}
                onChange={(e) => setUpdatedImage(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist">Artist</Label>
              <Input
                id="artist"
                value={updatedImage.artist || ""}
                onChange={(e) => setUpdatedImage(prev => ({ ...prev, artist: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="museum">Museum</Label>
              <Input
                id="museum"
                value={updatedImage.museum || ""}
                onChange={(e) => setUpdatedImage(prev => ({ ...prev, museum: e.target.value }))}
              />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

