import { API_BASE_URL } from '@/lib/constants'

export class HttpError extends Error {
  status: number
  data: unknown
  constructor(status: number, message: string, data?: unknown) {
    super(message)
    this.status = status
    this.data = data
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  params?: Record<string, string | number | boolean | undefined>
}

const buildUrl = (path: string, params?: RequestOptions['params']) => {
  const url = new URL(path, API_BASE_URL || window.location.origin)
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
  })
  return url.toString()
}

/** Wrapper fetch dùng chung — sẵn sàng cho kết nối BE */
async function request<T>(path: string, { body, params, headers, ...init }: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('fosales_token')
  const res = await fetch(buildUrl(path, params), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = res.headers.get('content-type')?.includes('application/json') ? await res.json() : await res.text()
  if (!res.ok) {
    const message = (data as { message?: string })?.message ?? res.statusText
    throw new HttpError(res.status, message, data)
  }
  return data as T
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, { ...options, body, method: 'POST' }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, { ...options, body, method: 'PUT' }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, { ...options, body, method: 'PATCH' }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'DELETE' }),
}

/** Giả lập độ trễ mạng cho mock */
export const sleep = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))
