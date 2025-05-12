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

export const fetcher = async (url: string) => {
  const res = await fetch(url, {
    credentials: "include",
  });
  await throwIfResNotOk(res);
  return res.json();
};

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
