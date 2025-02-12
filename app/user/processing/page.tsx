"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { ImagePlus, Upload, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface ProcessingImage {
  id: number
  title: string
  artist: string
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

export default function UserProcessing() {
  const router = useRouter()
  const [processingImages, setProcessingImages] = useState<ProcessingImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [uploadingId, setUploadingId] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState<string>("")
  const [uploadSuccess, setUploadSuccess] = useState<number | null>(null)
  const [selectedImage, setSelectedImage] = useState<ProcessingImage | null>(null)

  useEffect(() => {
    fetchProcessingImages()
  }, [])

  const fetchProcessingImages = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/my-processing`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch processing images")
      
      const data = await response.json()
      setProcessingImages(data.items)
      setError("")
    } catch (err) {
      setError("Error loading processing images. Please try again.")
      console.error("Error fetching processing images:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadProcessed = async (imageId: number, file: File) => {
    setUploadingId(imageId)
    setUploadError("")
    setUploadSuccess(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/${imageId}/upload-processed`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to upload processed image")
      }
      
      setUploadSuccess(imageId)
      setTimeout(() => {
        fetchProcessingImages()
        setUploadSuccess(null)
      }, 2000)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error uploading processed image")
      console.error("Error uploading processed image:", err)
    } finally {
      setUploadingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (processingImages.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <ImagePlus className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Images in Processing</h2>
            <p className="text-muted-foreground text-center mb-6">
              You don't have any images in processing. Visit the gallery to start processing images.
            </p>
            <Button onClick={() => router.push("/user/gallery")}>
              Go to Gallery
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">      
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md flex items-center gap-2 mb-6">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processingImages.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div 
                className="relative aspect-video mb-4 cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <Image
                  src={image.urls.thumbnails.medium}
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
              
              <div className="space-y-4">
                <Input
                  type="file"
                  accept="image/*"
                  id={`file-upload-${image.id}`}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleUploadProcessed(image.id, file)
                    }
                  }}
                />
                <Button 
                  onClick={() => document.getElementById(`file-upload-${image.id}`)?.click()}
                  className="w-full relative"
                  disabled={uploadingId === image.id || uploadSuccess === image.id}
                >
                  {uploadingId === image.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : uploadSuccess === image.id ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Uploaded Successfully
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Processed Image
                    </>
                  )}
                </Button>
                {uploadError && uploadingId === image.id && (
                  <p className="text-sm text-destructive mt-2">{uploadError}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Image Preview Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.title}</DialogTitle>
            <DialogDescription>Original image for processing</DialogDescription>
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
        </DialogContent>
      </Dialog>
    </div>
  )
}

