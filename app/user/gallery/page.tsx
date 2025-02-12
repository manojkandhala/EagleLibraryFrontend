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
import { Search, SortAsc, SortDesc, Loader2 } from "lucide-react"
import { useUserGallery } from "@/hooks/useQueries"
import { useRouter } from "next/navigation"

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
  const [page, setPage] = useState(1)
  const [allImages, setAllImages] = useState<ImageObject[]>([])
  const [selectedImage, setSelectedImage] = useState<ImageObject | null>(null)
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [orientation, setOrientation] = useState<"all" | "horizontal" | "vertical" | "other">("all")
  const [sortBy, setSortBy] = useState<"created_at" | "title" | "artist">("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
    // Only trigger once the element is fully mounted
    triggerOnce: false,
    // Delay the observation to prevent immediate triggers
    delay: 100,
  })

  const router = useRouter()

  const [processingId, setProcessingId] = useState<number | null>(null)

  // Memoize params creation to prevent unnecessary re-renders
  const params = useCallback(() => {
    const p = new URLSearchParams({
      page: page.toString(),
      page_size: "12",
      sort_by: sortBy,
      sort_order: sortOrder,
    })

    if (searchTerm) p.append("search_term", searchTerm)
    if (orientation && orientation !== "all") p.append("orientation", orientation)

    return p
  }, [page, sortBy, sortOrder, searchTerm, orientation])

  const { data, isLoading, error, refetch } = useUserGallery(params())
  const hasMore = data?.has_next || false

  // Refetch data when component mounts or user returns to the page
  useEffect(() => {
    // Reset page and images before refetching
    setPage(1)
    setAllImages([])
    refetch()
  }, [refetch])

  // Update allImages when new data arrives
  useEffect(() => {
    if (!data?.items) return

    setAllImages(prev => {
      if (page === 1) return data.items
      // Prevent duplicate images
      const newImages = data.items.filter(
        (newImg: ImageObject) => !prev.some((existingImg: ImageObject) => existingImg.id === newImg.id)
      )
      return [...prev, ...newImages]
    })
  }, [data, page])

  // Load more when scrolling
  useEffect(() => {
    // Don't trigger if:
    // 1. Not in view
    // 2. No more data
    // 3. Currently loading
    // 4. Initial page load (page === 1 && !data)
    if (!inView || !hasMore || isLoading || (page === 1 && !data)) return

    // Add a small delay to prevent rapid scrolling from triggering too many requests
    const timer = setTimeout(() => {
      setPage(p => p + 1)
    }, 100)

    return () => clearTimeout(timer)
  }, [inView, hasMore, isLoading, page, data])

  // Reset page and images when filters change
  const handleFilterChange = useCallback(() => {
    setPage(1)
    setAllImages([])
  }, [])

  const handleStartProcessing = async (imageId: number) => {
    setProcessingId(imageId)
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
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to start processing")
      }
      
      // Redirect to processing page on success
      router.push('/user/processing')
    } catch (err) {
      console.error("Error starting processing:", err)
      alert(err instanceof Error ? err.message : "Failed to start processing")
    } finally {
      setProcessingId(null)
    }
  }

  const toggleSortOrder = () => {
    setSortOrder(current => current === "asc" ? "desc" : "asc")
    handleFilterChange()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">User Gallery</h1>
        
        {error instanceof Error && (
          <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
            {error.message}
          </div>
        )}
        
        {/* Search and Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                handleFilterChange()
              }}
              className="pl-8"
            />
          </div>
          
          <Select 
            value={orientation} 
            onValueChange={(value: string) => {
              setOrientation(value as "all" | "horizontal" | "vertical" | "other")
              handleFilterChange()
            }}
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
              onValueChange={(value: string) => {
                setSortBy(value as "created_at" | "title" | "artist")
                handleFilterChange()
              }}
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
        {allImages.map((image: ImageObject) => (
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
                disabled={processingId === image.id}
                className="w-full"
              >
                {processingId === image.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting Process...
                  </>
                ) : (
                  'Start Processing'
                )}
              </Button>
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

