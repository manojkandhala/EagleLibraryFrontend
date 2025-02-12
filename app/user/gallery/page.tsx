"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useInView } from "react-intersection-observer"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, SortAsc, SortDesc } from "lucide-react"

interface ImageObject {
  id: number
  title: string
  artist: string
  museum?: string
  orientation: "horizontal" | "vertical" | "other"
  urls: {
    original: string
    thumbnails: {
      small: string
      medium: string
      large: string
      xlarge: string
    }
  }
}

export default function UserGallery() {
  const [images, setImages] = useState<ImageObject[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState("")
  const [selectedImage, setSelectedImage] = useState<ImageObject | null>(null)
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [orientation, setOrientation] = useState<"all" | "horizontal" | "vertical" | "other">("all")
  const [sortBy, setSortBy] = useState<"created_at" | "title" | "artist">("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  })

  const fetchImages = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: "12",
        sort_by: sortBy,
        sort_order: sortOrder,
      })

      if (searchTerm) params.append("search_term", searchTerm)
      if (orientation && orientation !== "all") params.append("orientation", orientation)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/available-images?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      if (!response.ok) throw new Error("Failed to fetch images")
      
      const data = await response.json()
      if (page === 1) {
        setImages(data.items)
      } else {
        setImages((prev) => [...prev, ...data.items])
      }
      setHasMore(data.has_next)
      setPage((p) => p + 1)
      setError("")
    } catch (err) {
      setError("Error loading images. Please try again.")
      console.error("Error fetching images:", err)
    } finally {
      setLoading(false)
    }
  }, [page, loading, hasMore, searchTerm, orientation, sortBy, sortOrder])

  useEffect(() => {
    setPage(1)
    setImages([])
    setHasMore(true)
    fetchImages()
  }, [searchTerm, orientation, sortBy, sortOrder])

  useEffect(() => {
    if (inView && page > 1) {
      fetchImages()
    }
  }, [inView, fetchImages])

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

  const toggleSortOrder = () => {
    setSortOrder(current => current === "asc" ? "desc" : "asc")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">User Gallery</h1>
        
        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
            {error}
          </div>
        )}
        
        {/* Search and Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select 
            value={orientation} 
            onValueChange={(value: string) => setOrientation(value as "all" | "horizontal" | "vertical" | "other")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select orientation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orientations</SelectItem>
              <SelectItem value="horizontal">Horizontal</SelectItem>
              <SelectItem value="vertical">Vertical</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
            <Select 
              value={sortBy} 
              onValueChange={(value: string) => setSortBy(value as "created_at" | "title" | "artist")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Added</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="artist">Artist</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSortOrder}
              className="flex-shrink-0"
            >
              {sortOrder === "asc" ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div 
                className="relative aspect-video mb-4 cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <Image
                  src={image.urls.thumbnails.small}
                  alt={image.title}
                  fill
                  className="object-cover hover:opacity-90 transition-opacity"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false}
                  loading="lazy"
                />
              </div>
              <h2 className="text-lg font-semibold line-clamp-1">{image.title}</h2>
              <p className="text-sm text-muted-foreground line-clamp-1 mb-4">{image.artist}</p>
              <Button
                onClick={() => handleStartProcessing(image.id)}
                className="w-full"
              >
                Start Processing
              </Button>
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

      {/* Image Preview Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.title}</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={selectedImage.urls.original}
                alt={selectedImage.title}
                fill
                className="object-contain"
                priority
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <p className="font-medium">{selectedImage?.artist}</p>
            {selectedImage?.museum && (
              <p className="text-sm text-muted-foreground">Museum: {selectedImage.museum}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

