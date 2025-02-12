"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"

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
  processing_history: {
    user_id: number
    status: string
    started_at: string
    completed_at: string
  }[]
}

export default function DetailedImagePage() {
  const { id } = useParams()
  const [image, setImage] = useState<ImageObject | null>(null)
  const [updatedImage, setUpdatedImage] = useState<Partial<ImageObject>>({})

  useEffect(() => {
    fetchImageDetails()
  }, []) // Removed unnecessary dependency 'id'

  const fetchImageDetails = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setImage(data)
        setUpdatedImage(data)
      } else {
        console.error("Failed to fetch image details")
      }
    } catch (error) {
      console.error("Error fetching image details:", error)
    }
  }

  const handleUpdateImage = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedImage),
      })
      if (response.ok) {
        fetchImageDetails()
      } else {
        console.error("Failed to update image")
      }
    } catch (error) {
      console.error("Error updating image:", error)
    }
  }

  if (!image) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Image Details</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-4">
            <Image
              src={image.urls.original || "/placeholder.svg"}
              alt={image.title}
              width={800}
              height={800}
              className="w-full h-auto object-contain"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleUpdateImage}>
              <div className="grid gap-4">
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
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={updatedImage.tags?.join(", ") || ""}
                    onChange={(e) => setUpdatedImage({ ...updatedImage, tags: e.target.value.split(", ") })}
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
                    className="w-full p-2 border rounded"
                  >
                    <option value="horizontal">Horizontal</option>
                    <option value="vertical">Vertical</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <Button type="submit">Update Image</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-8">
        <CardContent className="p-4">
          <h2 className="text-2xl font-bold mb-4">Processing History</h2>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">User ID</th>
                <th className="text-left">Status</th>
                <th className="text-left">Started At</th>
                <th className="text-left">Completed At</th>
              </tr>
            </thead>
            <tbody>
              {image.processing_history.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.user_id}</td>
                  <td>{entry.status}</td>
                  <td>{new Date(entry.started_at).toLocaleString()}</td>
                  <td>{entry.completed_at ? new Date(entry.completed_at).toLocaleString() : "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

