import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorJson;
    try {
      errorJson = await res.json();
    } catch (e) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }
    
    // For payment required errors (402), preserve all response data
    if (res.status === 402) {
      const error = new Error(errorJson.details || errorJson.message || `HTTP error ${res.status}: ${res.statusText}`);
      (error as any).status = res.status;
      (error as any).pricing = errorJson.pricing;
      (error as any).redirectTo = errorJson.redirectTo;
      (error as any).requiresPayment = errorJson.requiresPayment;
      throw error;
    }
    
    if (errorJson && errorJson.message) {
      // If there are detailed validation errors, include them in the error message
      if (errorJson.errors && Array.isArray(errorJson.errors) && errorJson.errors.length > 0) {
        const validationErrors = errorJson.errors
          .map((err: any) => err.message || JSON.stringify(err))
          .join('; ');
        throw new Error(`${errorJson.message}: ${validationErrors}`);
      }
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

// Overloaded function for backward compatibility
export async function apiRequest(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  body?: any,
  options?: { headers?: Record<string, string> }
): Promise<any>;
export async function apiRequest(
  url: string,
  options?: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: any;
    headers?: Record<string, string>;
  }
): Promise<any>;
export async function apiRequest(
  methodOrUrl: string,
  urlOrOptions?: string | {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: any;
    headers?: Record<string, string>;
  },
  body?: any,
  options?: { headers?: Record<string, string> }
): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout
  
  let method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  let url: string;
  let requestBody: any;
  let headers: Record<string, string> = {};

  // Determine which signature is being used
  if (typeof urlOrOptions === 'string') {
    // New signature: apiRequest(method, url, body?, options?)
    method = methodOrUrl as "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    url = urlOrOptions;
    requestBody = body;
    headers = options?.headers || {};
  } else {
    // Old signature: apiRequest(url, options?)
    url = methodOrUrl;
    const opts = urlOrOptions || {};
    method = opts.method || "GET";
    requestBody = opts.body;
    headers = opts.headers || {};
  }
  
  // Automatically JSON.stringify body if it's an object
  if (requestBody && typeof requestBody === 'object' && !(requestBody instanceof FormData) && !(requestBody instanceof URLSearchParams)) {
    requestBody = JSON.stringify(requestBody);
  }
  
  try {
    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: requestBody,
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