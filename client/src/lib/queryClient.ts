import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // Try to parse response as JSON first
      const clonedResponse = res.clone();
      const jsonData = await clonedResponse.json();
      
      // If we have a message in the JSON, use it
      if (jsonData && typeof jsonData === 'object' && jsonData.message) {
        throw new Error(jsonData.message);
      }
      
      // Otherwise use the JSON stringified
      throw new Error(`${res.status}: ${JSON.stringify(jsonData)}`);
    } catch (jsonError) {
      // If JSON parsing fails, fall back to text
      try {
        const text = await res.text();
        throw new Error(`${res.status}: ${text || res.statusText}`);
      } catch (textError) {
        // If all else fails, just use status text
        throw new Error(`${res.status}: ${res.statusText}`);
      }
    }
  }
}

// Optimized fetcher with AbortController for request cancellation
export const fetcher = async (url: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout
  
  try {
    const res = await fetch(url, {
      credentials: "include",
      signal: controller.signal,
      cache: 'default' // Let the browser handle caching
    });
    await throwIfResNotOk(res);
    return res.json();
  } finally {
    clearTimeout(timeoutId);
  }
};

// Optimized API request function with timeout and abort controller
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout
  
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
      signal: controller.signal,
      cache: method.toLowerCase() === 'get' ? 'default' : 'no-store' // Cache GET requests but not mutations
    });

    await throwIfResNotOk(res);
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout
    
    try {
      const url = queryKey[0] as string;
      const res = await fetch(url, {
        credentials: "include",
        signal: controller.signal,
        cache: 'default' // Allow browser caching
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } finally {
      clearTimeout(timeoutId);
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false,
      gcTime: 15 * 60 * 1000, // 15 minutes
      cacheTime: 15 * 60 * 1000, // 15 minutes
      refetchOnMount: true, // Refetch on mount if data is stale
      refetchOnReconnect: true, // Refetch on reconnect if data is stale
    },
    mutations: {
      retry: false,
      // Reduce network traffic by batching mutation requests
      networkMode: 'always',
    },
  },
});
