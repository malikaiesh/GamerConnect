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

// Helper for setting different cache times for different API endpoints
const getCacheSettings = (queryKey: string) => {
  // Frequently accessed but rarely changing data - cache longer
  if (
    queryKey.includes('/api/settings') || 
    queryKey.includes('/api/categories') ||
    queryKey.includes('/api/static-pages')
  ) {
    return {
      staleTime: 30 * 60 * 1000, // 30 minutes
      gcTime: 60 * 60 * 1000, // 60 minutes
    };
  }
  
  // Semi-dynamic data - moderate cache time
  if (
    queryKey.includes('/api/games/featured') || 
    queryKey.includes('/api/homepage-content')
  ) {
    return {
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 20 * 60 * 1000, // 20 minutes
    };
  }
  
  // Most dynamic data - shorter cache time
  return {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // Default: 5 minutes
      gcTime: 15 * 60 * 1000, // Default: 15 minutes
      retry: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
      networkMode: 'always', // Reduce network traffic by batching mutation requests
    },
  },
});

// Override cache settings based on query key
const originalDefaultQueryFn = queryClient.getDefaultOptions().queries?.queryFn;
queryClient.setDefaultOptions({
  queries: {
    ...queryClient.getDefaultOptions().queries,
    queryFn: (context) => {
      const queryKey = context.queryKey[0] as string;
      const cacheSettings = getCacheSettings(queryKey);
      
      // Override the staleTime and gcTime based on the query key
      context.options.staleTime = cacheSettings.staleTime;
      context.options.gcTime = cacheSettings.gcTime;
      
      // Call the original query function
      return originalDefaultQueryFn?.(context) as Promise<unknown>;
    },
  },
});
