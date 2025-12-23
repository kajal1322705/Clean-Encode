import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

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

interface ApiResponse<T> {
  success: boolean;
  data: T | { data: T; total?: number; page?: number; totalPages?: number };
  message?: string;
  timestamp?: string;
}

function extractData<T>(response: unknown): T {
  if (response && typeof response === "object" && "success" in response) {
    const apiResponse = response as ApiResponse<T>;
    if (apiResponse.success && apiResponse.data !== undefined) {
      const data = apiResponse.data;
      if (data && typeof data === "object" && "data" in data && Array.isArray((data as { data: unknown }).data)) {
        return (data as { data: T }).data;
      }
      return data as T;
    }
  }
  return response as T;
}

export function getQueryFn<T>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<T> {
  const { on401: unauthorizedBehavior } = options;
  return async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null as T;
    }

    await throwIfResNotOk(res);
    const json = await res.json();
    return extractData<T>(json);
  };
}

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
