"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { ArrowLeft, Loader2 } from "lucide-react"

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
  processing_history?: Array<{
    user_id: number
    status: string
    started_at: string
    completed_at: string
  }>
}

export default function ImageDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [image, setImage] = useState<ImageObject | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [updatedImage, setUpdatedImage] = useState<Partial<ImageObject>>({})

  useEffect(() => {
    fetchImageDetails()
  }, [id])

  const fetchImageDetails = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch image details")
      
      const data = await response.json()
      setImage(data)
      setUpdatedImage(data)
      setError("")
    } catch (err) {
      setError("Error loading image details. Please try again.")
      console.error("Error fetching image details:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateImage = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedImage),
      })
      if (!response.ok) throw new Error("Failed to update image")
      
      await fetchImageDetails()
    } catch (err) {
      setError("Error updating image. Please try again.")
      console.error("Error updating image:", err)
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!image) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Image not found</p>
        <Button onClick={() => router.back()} variant="outline" className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          onClick={() => router.back()} 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Gallery
        </Button>
        <h1 className="text-3xl font-bold">{image.title}</h1>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
          {error}
        </div>
      )}

      {/* Original Image */}
      <Card>
        <CardHeader>
          <CardTitle>Original Image</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video w-full max-h-[70vh]">
            <Image
              src={image.urls.original}
              alt={image.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
            />
          </div>
        </CardContent>
      </Card>

      {/* Image Details */}
      <Card>
        <CardHeader>
          <CardTitle>Image Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateImage} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={updatedImage.title || ""}
                  onChange={(e) => setUpdatedImage({ ...updatedImage, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="artist">Artist</Label>
                <Input
                  id="artist"
                  value={updatedImage.artist || ""}
                  onChange={(e) => setUpdatedImage({ ...updatedImage, artist: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="museum">Museum</Label>
                <Input
                  id="museum"
                  value={updatedImage.museum || ""}
                  onChange={(e) => setUpdatedImage({ ...updatedImage, museum: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={updatedImage.tags?.join(", ") || ""}
                  onChange={(e) => setUpdatedImage({ ...updatedImage, tags: e.target.value.split(", ").map(tag => tag.trim()) })}
                />
              </div>
              <div>
                <Label htmlFor="orientation">Orientation</Label>
                <select
                  id="orientation"
                  value={updatedImage.orientation || ""}
                  onChange={(e) =>
                    setUpdatedImage({
                      ...updatedImage,
                      orientation: e.target.value as "horizontal" | "vertical" | "other",
                    })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                >
                  <option value="horizontal">Horizontal</option>
                  <option value="vertical">Vertical</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="is_processing">Processing Status</Label>
                <select
                  id="is_processing"
                  value={updatedImage.is_processing ? "true" : "false"}
                  onChange={(e) =>
                    setUpdatedImage({
                      ...updatedImage,
                      is_processing: e.target.value === "true",
                    })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                >
                  <option value="false">Not Processing</option>
                  <option value="true">Processing</option>
                </select>
              </div>
              <div>
                <Label htmlFor="processor_id">Processor ID</Label>
                <Input
                  id="processor_id"
                  type="number"
                  value={updatedImage.processor_id || ""}
                  onChange={(e) => setUpdatedImage({ ...updatedImage, processor_id: parseInt(e.target.value) || undefined })}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Image'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Processing History */}
      <Card>
        <CardHeader>
          <CardTitle>Processing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">User ID</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Started At</th>
                  <th className="p-2 text-left">Completed At</th>
                </tr>
              </thead>
              <tbody>
                {(!image.processing_history || image.processing_history.length === 0) ? (
                  <tr>
                    <td colSpan={4} className="p-2 text-center text-muted-foreground">
                      No processing history available
                    </td>
                  </tr>
                ) : (
                  image.processing_history.map((entry, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{entry.user_id}</td>
                      <td className="p-2">{entry.status}</td>
                      <td className="p-2">{new Date(entry.started_at).toLocaleString()}</td>
                      <td className="p-2">
                        {entry.completed_at ? new Date(entry.completed_at).toLocaleString() : "In Progress"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

