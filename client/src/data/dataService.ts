import { queryClient } from "@/lib/queryClient";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface RequestConfig<T> {
  method: HttpMethod;
  path: string;
  body?: unknown;
  signal?: AbortSignal;
  transform?: (data: unknown) => T;
}

interface EncryptionHooks {
  encrypt?: (data: unknown) => unknown;
  decrypt?: (data: unknown) => unknown;
}

let encryptionHooks: EncryptionHooks = {};

export function setEncryptionHooks(hooks: EncryptionHooks) {
  encryptionHooks = hooks;
}

async function request<T>({ method, path, body, signal, transform }: RequestConfig<T>): Promise<T> {
  const processedBody = body && encryptionHooks.encrypt ? encryptionHooks.encrypt(body) : body;
  
  const response = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: processedBody ? JSON.stringify(processedBody) : undefined,
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  
  let data = await response.json();
  data = encryptionHooks.decrypt ? encryptionHooks.decrypt(data) : data;
  return transform ? transform(data) : data;
}

export const dataGateway = {
  auth: {
    login: (credentials: { username: string; password: string; role?: string }) =>
      request({ method: "POST", path: "/api/auth/login", body: credentials }),
    logout: () => request({ method: "POST", path: "/api/auth/logout" }),
    verifyOtp: (data: { userId: string; otp: string }) =>
      request({ method: "POST", path: "/api/auth/verify-otp", body: data }),
    forgotPassword: (data: { email: string }) =>
      request({ method: "POST", path: "/api/auth/forgot-password", body: data }),
    resetPassword: (data: { token: string; newPassword: string }) =>
      request({ method: "POST", path: "/api/auth/reset-password", body: data }),
  },

  dashboard: {
    getStats: () => request({ method: "GET", path: "/api/dashboard/stats" }),
    getSalesTrend: () => request({ method: "GET", path: "/api/dashboard/sales-trend" }),
    getServiceMetrics: () => request({ method: "GET", path: "/api/dashboard/service-metrics" }),
  },

  bookings: {
    getAll: () => request({ method: "GET", path: "/api/bookings" }),
    getById: (id: string) => request({ method: "GET", path: `/api/bookings/${id}` }),
    getRecent: (limit = 5) => request({ method: "GET", path: `/api/bookings/recent?limit=${limit}` }),
    create: (data: unknown) => request({ method: "POST", path: "/api/bookings", body: data }),
    update: (id: string, data: unknown) => request({ method: "PATCH", path: `/api/bookings/${id}`, body: data }),
    delete: (id: string) => request({ method: "DELETE", path: `/api/bookings/${id}` }),
  },

  deliveries: {
    getAll: () => request({ method: "GET", path: "/api/deliveries" }),
    getById: (id: string) => request({ method: "GET", path: `/api/deliveries/${id}` }),
    create: (data: unknown) => request({ method: "POST", path: "/api/deliveries", body: data }),
    update: (id: string, data: unknown) => request({ method: "PATCH", path: `/api/deliveries/${id}`, body: data }),
  },

  jobCards: {
    getAll: () => request({ method: "GET", path: "/api/job-cards" }),
    getById: (id: string) => request({ method: "GET", path: `/api/job-cards/${id}` }),
    getActive: () => request({ method: "GET", path: "/api/job-cards/active" }),
    create: (data: unknown) => request({ method: "POST", path: "/api/job-cards", body: data }),
    update: (id: string, data: unknown) => request({ method: "PATCH", path: `/api/job-cards/${id}`, body: data }),
    delete: (id: string) => request({ method: "DELETE", path: `/api/job-cards/${id}` }),
  },

  inventory: {
    getAll: () => request({ method: "GET", path: "/api/inventory" }),
    getByStatus: (status: string) => request({ method: "GET", path: `/api/inventory?status=${status}` }),
    create: (data: unknown) => request({ method: "POST", path: "/api/inventory", body: data }),
    update: (id: string, data: unknown) => request({ method: "PATCH", path: `/api/inventory/${id}`, body: data }),
  },

  testRides: {
    getAll: () => request({ method: "GET", path: "/api/test-rides" }),
    create: (data: unknown) => request({ method: "POST", path: "/api/test-rides", body: data }),
    update: (id: string, data: unknown) => request({ method: "PATCH", path: `/api/test-rides/${id}`, body: data }),
  },

  spares: {
    getAll: () => request({ method: "GET", path: "/api/spares" }),
    getById: (id: string) => request({ method: "GET", path: `/api/spares/${id}` }),
    create: (data: unknown) => request({ method: "POST", path: "/api/spares", body: data }),
    update: (id: string, data: unknown) => request({ method: "PATCH", path: `/api/spares/${id}`, body: data }),
  },

  grn: {
    getAll: () => request({ method: "GET", path: "/api/grn" }),
    create: (data: unknown) => request({ method: "POST", path: "/api/grn", body: data }),
  },

  spareOrders: {
    getAll: () => request({ method: "GET", path: "/api/spare-orders" }),
    create: (data: unknown) => request({ method: "POST", path: "/api/spare-orders", body: data }),
    update: (id: string, data: unknown) => request({ method: "PATCH", path: `/api/spare-orders/${id}`, body: data }),
  },

  warrantyClaims: {
    getAll: () => request({ method: "GET", path: "/api/warranty-claims" }),
    getById: (id: string) => request({ method: "GET", path: `/api/warranty-claims/${id}` }),
    create: (data: unknown) => request({ method: "POST", path: "/api/warranty-claims", body: data }),
    update: (id: string, data: unknown) => request({ method: "PATCH", path: `/api/warranty-claims/${id}`, body: data }),
  },

  leads: {
    getAll: () => request({ method: "GET", path: "/api/leads" }),
    getById: (id: string) => request({ method: "GET", path: `/api/leads/${id}` }),
    create: (data: unknown) => request({ method: "POST", path: "/api/leads", body: data }),
    update: (id: string, data: unknown) => request({ method: "PATCH", path: `/api/leads/${id}`, body: data }),
  },

  complaints: {
    getAll: () => request({ method: "GET", path: "/api/complaints" }),
    getById: (id: string) => request({ method: "GET", path: `/api/complaints/${id}` }),
    create: (data: unknown) => request({ method: "POST", path: "/api/complaints", body: data }),
    update: (id: string, data: unknown) => request({ method: "PATCH", path: `/api/complaints/${id}`, body: data }),
  },

  batteryHealth: {
    getByVin: (vin: string) => request({ method: "GET", path: `/api/battery-health/${vin}` }),
    getAll: () => request({ method: "GET", path: "/api/battery-health" }),
  },

  dealers: {
    getAll: () => request({ method: "GET", path: "/api/dealers" }),
    getById: (id: string) => request({ method: "GET", path: `/api/dealers/${id}` }),
    create: (data: unknown) => request({ method: "POST", path: "/api/dealers", body: data }),
  },

  invalidateQueries: (keys: string[]) => {
    keys.forEach(key => queryClient.invalidateQueries({ queryKey: [key] }));
  },
};

export type DataGateway = typeof dataGateway;
