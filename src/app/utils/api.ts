// Prefer an explicit API base URL for the backend. Set VITE_API_BASE_URL in .env for local/dev
// or production builds. If not provided, fall back to the legacy Supabase functions URL only
// to preserve compatibility while migrating the backend.
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;
// Do not fall back to Supabase function URLs. Require `VITE_API_BASE_URL` to be set.
export const API_BASE_URL = VITE_API_BASE_URL ?? "";

// Provide the legacy public anon key (if present) so callers that still rely on
// a Supabase-style Authorization header can access it from a single place.
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

// Helper function to make API requests
export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error(
      'API_BASE_URL is not set. Please set VITE_API_BASE_URL in your .env (e.g. VITE_API_BASE_URL=http://localhost:8787)'
    );
  }
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // Only include the public anon key if present (legacy Supabase endpoints).
      ...(publicAnonKey ? { 'Authorization': `Bearer ${publicAnonKey}` } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `API request failed: ${response.statusText}`);
  }

  return response.json();
}

// Category Types
export interface Category {
  id: string;
  name: string;
  icon: string;
  order: number;
  createdAt: string;
}

// Product Types
export interface Package {
  id: string;
  name: string;
  price: number;
  duration?: string;
}

export interface PackageGroup {
  id: string;
  groupName: string;
  packages: Package[];
}

export interface CustomField {
  name: string;
  type: string;
  helper?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  categoryId: string;
  categoryName?: string;
  packages: Package[];
  packageGroups?: PackageGroup[];
  customFields: CustomField[];
  status: 'active' | 'inactive';
  createdAt: string;
}

// Order Types
export interface Order {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  packageName: string;
  price: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customFields: Record<string, string>;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  userActualName?: string | null;
  userMainEmail?: string | null;
  userNesubsEmail?: string | null;
}

// API Functions

// Categories
export async function getCategories(): Promise<Category[]> {
  const response = await apiRequest<{ success: boolean; categories: Category[] }>('/categories');
  return response.categories;
}

// Products
export async function getProducts(): Promise<Product[]> {
  const response = await apiRequest<{ success: boolean; products: Product[] }>('/products');
  return response.products;
}

export async function getProduct(id: string): Promise<Product> {
  const response = await apiRequest<{ success: boolean; product: Product }>(`/products/${id}`);
  return response.product;
}

// Orders
export async function getOrders(): Promise<Order[]> {
  const response = await apiRequest<{ success: boolean; orders: Order[] }>('/orders');
  return response.orders;
}