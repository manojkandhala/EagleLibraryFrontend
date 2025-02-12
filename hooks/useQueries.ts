import { useQuery } from "@tanstack/react-query"

const fetchWithAuth = async (url: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
  if (!response.ok) throw new Error("API request failed")
  return response.json()
}

// Common query options for user-related queries
const userQueryOptions = {
  staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
  gcTime: 1000 * 60 * 10, // Cache is kept for 10 minutes
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  retry: 1,
}

// Common query options for data that needs more frequent updates
const realtimeQueryOptions = {
  staleTime: 1000 * 30, // Data stays fresh for 30 seconds
  gcTime: 1000 * 60 * 2, // Cache is kept for 2 minutes
  refetchOnMount: "always" as const,
  refetchOnWindowFocus: true,
  retry: 1,
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: () => fetchWithAuth("/users/me"),
    ...userQueryOptions,
  })
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => fetchWithAuth("/admin/users?skip=0&limit=100"),
    ...userQueryOptions,
  })
}

export function useAdminOverview() {
  return useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => fetchWithAuth("/admin/processing-overview"),
    ...realtimeQueryOptions,
  })
}

export function useAdminGallery(params: URLSearchParams) {
  return useQuery({
    queryKey: ["admin", "gallery", params.toString()],
    queryFn: () => fetchWithAuth(`/images?${params.toString()}`),
    ...realtimeQueryOptions,
  })
}

export function useUserStats() {
  return useQuery({
    queryKey: ["user", "stats"],
    queryFn: () => fetchWithAuth("/users/my-stats"),
    ...realtimeQueryOptions,
  })
}

export function useUserProcessing() {
  return useQuery({
    queryKey: ["user", "processing"],
    queryFn: () => fetchWithAuth("/images/my-processing"),
    ...realtimeQueryOptions,
  })
}

export function useUserGallery(params: URLSearchParams) {
  return useQuery({
    queryKey: ["user", "gallery", params.toString()],
    queryFn: () => fetchWithAuth(`/users/available-images?${params.toString()}`),
    ...realtimeQueryOptions,
    staleTime: 1000 * 60 * 2, // Keep data fresh for 2 minutes
    gcTime: 1000 * 60 * 5,    // Keep cache for 5 minutes
    refetchOnMount: false,     // Don't refetch on mount
    refetchOnWindowFocus: false // Don't refetch on window focus
  })
} 