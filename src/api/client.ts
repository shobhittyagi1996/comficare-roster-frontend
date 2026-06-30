import axios, { type AxiosError } from 'axios';
import toast from 'react-hot-toast';
import type { ApiEnvelope } from '@/types';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api',
  headers: {
    'Content-Type': 'application/json',
    'X-Tenant-Id': import.meta.env.VITE_TENANT_ID || 'vill-del-sole-TN-1',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiEnvelope<unknown>>) => {
    const message = error.response?.data?.error || error.message || 'Request failed';
    toast.error(message);
    return Promise.reject(error);
  }
);

export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await apiClient.get<ApiEnvelope<T>>(url, { params });
  return res.data.data;
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const res = await apiClient.post<ApiEnvelope<T>>(url, body);
  return res.data.data;
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const res = await apiClient.put<ApiEnvelope<T>>(url, body);
  return res.data.data;
}

export async function apiDelete(url: string): Promise<void> {
  await apiClient.delete(url);
}
