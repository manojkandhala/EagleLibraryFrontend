import { useQuery } from "@tanstack/react-query"

const fetchWithAuth = async (url: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
  if (response.ok) return response.json()

  if (response.status === 401) {
    // Attempt token refresh
    const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/token/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        refresh_token: localStorage.getItem("refresh_token") || "",
      }),
    });

    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json();
      localStorage.setItem("token", refreshData.access_token);
      localStorage.setItem("refresh_token", refreshData.refresh_token);
      // Retry original request with new token
      const retryResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!retryResponse.ok) throw new Error("API request failed after token refresh");
      return retryResponse.json();
    } else {
      // Token refresh failed, redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("refresh_token");
      window.location.href = "/"; // Redirect to home page (login form)
      throw new Error("Token refresh failed"); // To prevent further execution
    }
  }

  throw new Error("API request failed"); // General error for other non-401 errors
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
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        return null;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      
      return response.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
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
    queryFn: () => fetchWithAuth(`/images/?${params.toString()}`),
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Disable caching completely
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
    retry: 1
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
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Disable caching completely
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
    retry: 1
  })
}