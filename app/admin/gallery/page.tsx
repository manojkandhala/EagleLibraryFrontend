"use client"

import { useState, useEffect, useCallback } from "react"
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
  const [page, setPage] = useState(1)
  const [allImages, setAllImages] = useState<ImageObject[]>([])
  const [selectedImage, setSelectedImage] = useState<ImageObject | null>(null)
  const [isUpdateImageOpen, setIsUpdateImageOpen] = useState(false)
  const [updatedImage, setUpdatedImage] = useState<Partial<ImageObject>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [orientation, setOrientation] = useState<"" | "horizontal" | "vertical" | "other">("")
  const [museum, setMuseum] = useState("")
  const [sortBy, setSortBy] = useState<"created_at" | "title" | "artist">("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
    triggerOnce: false,
    delay: 100,
  })

  // Memoize params creation to prevent unnecessary re-renders
  const params = useCallback(() => {
    const p = new URLSearchParams({
      page: page.toString(),
      page_size: "12",
      sort_by: sortBy,
      sort_order: sortOrder,
    })

    if (searchTerm) p.append("search_term", searchTerm)
    if (orientation) p.append("orientation", orientation)
    if (museum) p.append("museum", museum)

    return p
  }, [page, sortBy, sortOrder, searchTerm, orientation, museum])

  const { data, isLoading, error, refetch } = useAdminGallery(params())
  const hasMore = data?.has_next || false

  // Update allImages when new data arrives
  useEffect(() => {
    if (!data?.items) return

    setAllImages(prev => {
      if (page === 1 || isUpdating) return data.items
      // Prevent duplicate images
      const newImages = data.items.filter(
        (newImg: ImageObject) => !prev.some((existingImg: ImageObject) => existingImg.id === newImg.id)
      )
      return [...prev, ...newImages]
    })

    if (isUpdating) {
      setIsUpdating(false)
    }
  }, [data, page, isUpdating])

  // Load more when scrolling
  useEffect(() => {
    if (!inView || !hasMore || isLoading || isUpdating || (page === 1 && !data)) return

    const timer = setTimeout(() => {
      setPage(p => p + 1)
    }, 100)

    return () => clearTimeout(timer)
  }, [inView, hasMore, isLoading, page, data, isUpdating])

  // Reset page and images when filters change
  const handleFilterChange = useCallback(() => {
    setPage(1)
    setAllImages([])
  }, [])

  const handleUpdateImage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedImage) return

    setIsSubmitting(true)
    try {
      // Find which fields have changed
      const changedFields = Object.entries(updatedImage).reduce((acc, [key, value]) => {
        if (selectedImage && value !== selectedImage[key as keyof ImageObject]) {
          // Handle empty processor_id correctly
          if (key === 'processor_id' && (value === undefined || value === 0)) {
            acc[key] = null
          } else {
            acc[key] = value
          }
        }
        return acc
      }, {} as Record<string, any>)

      if (Object.keys(changedFields).length === 0) {
        setIsUpdateImageOpen(false)
        setIsSubmitting(false)
        return
      }

      console.log('Sending update:', changedFields)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/${selectedImage.id}`, {
        method: "PUT",
        headers: {
          "accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(changedFields)
      })

      const responseData = await response.text()
      console.log('Response:', response.status, responseData)

      if (!response.ok) {
        const errorData = JSON.parse(responseData)
        throw new Error(errorData.detail || "Failed to update image")
      }

      // Close dialog and reset state
      setIsUpdateImageOpen(false)
      setUpdatedImage({})
      
      // Set updating flag and reset page
      setIsUpdating(true)
      setAllImages([])
      setPage(1)
      
      // Refetch the data
      await refetch()
    } catch (error) {
      console.error("Error updating image:", error)
      if (error instanceof Error) {
        alert(error.message)
      }
    } finally {
      setIsSubmitting(false)
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
      
      setAllImages((prev) => prev.filter((img) => img.id !== imageId))
    } catch (err) {
      console.error("Error deleting image:", err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Gallery</h1>
      </div>
      
      {error instanceof Error && (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
          {error.message}
        </div>
      )}

      <div className="grid gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by title, artist, or tags..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              handleFilterChange()
            }}
            className="flex-1"
          />
          <select
            value={orientation}
            onChange={(e) => {
              setOrientation(e.target.value as any)
              handleFilterChange()
            }}
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
            onChange={(e) => {
              setMuseum(e.target.value)
              handleFilterChange()
            }}
            className="flex-1 sm:max-w-[200px]"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as any)
              handleFilterChange()
            }}
            className="h-10 rounded-md border border-input bg-transparent px-3 py-1"
          >
            <option value="created_at">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="artist">Sort by Artist</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as any)
              handleFilterChange()
            }}
            className="h-10 rounded-md border border-input bg-transparent px-3 py-1"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allImages.map((image: ImageObject) => (
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
                    // Initialize all editable fields
                    setUpdatedImage({
                      title: image.title,
                      artist: image.artist,
                      museum: image.museum || "",
                      tags: image.tags || [],
                      orientation: image.orientation,
                      is_processing: image.is_processing,
                      processor_id: image.processor_id
                    })
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
      </div>

      {/* Infinite scroll trigger */}
      <div ref={ref} className="h-10">
        {isLoading && (
          <div className="flex justify-center">
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
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={updatedImage.tags?.join(", ") || ""}
                onChange={(e) => setUpdatedImage(prev => ({ 
                  ...prev, 
                  tags: e.target.value.split(",").map(tag => tag.trim()).filter(Boolean)
                }))}
                placeholder="tag1, tag2, tag3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orientation">Orientation</Label>
              <select
                id="orientation"
                value={updatedImage.orientation || ""}
                onChange={(e) => setUpdatedImage(prev => ({ 
                  ...prev, 
                  orientation: e.target.value as "horizontal" | "vertical" | "other"
                }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="is_processing">Processing Status</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_processing"
                  checked={updatedImage.is_processing || false}
                  onChange={(e) => setUpdatedImage(prev => ({ 
                    ...prev, 
                    is_processing: e.target.checked
                  }))}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="is_processing">Is Processing</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="processor_id">Processor ID</Label>
              <Input
                id="processor_id"
                type="number"
                value={updatedImage.processor_id || ""}
                onChange={(e) => setUpdatedImage(prev => ({ 
                  ...prev, 
                  processor_id: e.target.value ? parseInt(e.target.value) : undefined
                }))}
                placeholder="Enter processor ID"
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

