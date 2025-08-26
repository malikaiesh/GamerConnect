import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorJson;
    try {
      errorJson = await res.json();
    } catch (e) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }
    
    if (errorJson && errorJson.message) {
      throw new Error(errorJson.message);
    } else {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }
  }
}

export const fetcher = async (url: string) => {
  try {
    // Add cache busting for development only
    const finalUrl = process.env.NODE_ENV === 'development' ? 
      url + (url.includes('?') ? '&_cb=' + Date.now() : '?_cb=' + Date.now()) : 
      url;
      
    const res = await fetch(finalUrl, {
      credentials: "include"
    });
    
    if (!res.ok) {
      const error = new Error(`An error occurred while fetching the data: ${res.statusText}`);
      throw error;
    }
    
    return await res.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred');
  }
};

export async function apiRequest(
  url: string,
  options?: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: string;
    headers?: Record<string, string>;
  }
) {
  const method = options?.method || "GET";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout
  
  try {
    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: options?.body,
      signal: controller.signal
    });
    
    await throwIfResNotOk(res);
    
    if (method === "DELETE") {
      return res;
    }
    
    return res.json();
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
      staleTime: 60000, // 1 minute
      retry: false,
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});