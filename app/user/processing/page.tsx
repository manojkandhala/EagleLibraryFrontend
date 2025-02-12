"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Image from "next/image"

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
  const [processingImages, setProcessingImages] = useState<ProcessingImage[]>([])

  useEffect(() => {
    fetchProcessingImages()
  }, [])

  const fetchProcessingImages = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/my-processing`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setProcessingImages(data.items)
      } else {
        console.error("Failed to fetch processing images")
      }
    } catch (error) {
      console.error("Error fetching processing images:", error)
    }
  }

  const handleUploadProcessed = async (imageId: number, file: File) => {
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
      if (response.ok) {
        // Refresh the processing images after successful upload
        fetchProcessingImages()
      } else {
        console.error("Failed to upload processed image")
      }
    } catch (error) {
      console.error("Error uploading processed image:", error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Processing</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {processingImages.map((image) => (
          <Card key={image.id}>
            <CardContent className="p-4">
              <Image
                src={image.urls.thumbnails.medium || "/placeholder.svg"}
                alt={image.title}
                width={500}
                height={500}
                className="w-full h-48 object-cover mb-2"
              />
              <h2 className="text-lg font-semibold">{image.title}</h2>
              <p className="text-sm text-gray-500">{image.artist}</p>
              <div className="mt-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleUploadProcessed(image.id, file)
                    }
                  }}
                />
                <Button onClick={() => document.getElementById(`file-upload-${image.id}`)?.click()} className="mt-2">
                  Upload Processed Image
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

