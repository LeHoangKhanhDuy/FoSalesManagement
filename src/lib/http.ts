import { API_BASE_URL } from '@/lib/constants'

export class HttpError extends Error {
  status: number
  code?: string
  retryAfter?: number
  data: unknown
  constructor(status: number, message: string, data?: unknown) {
    super(message)
    this.status = status
    this.data = data
    const body = (data ?? {}) as { code?: unknown; retryAfter?: unknown }
    if (typeof body.code === 'string') this.code = body.code
    if (typeof body.retryAfter === 'number') this.retryAfter = body.retryAfter
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  params?: Record<string, string | number | boolean | undefined>
}

const CSRF_COOKIE = 'fs_csrf'
const CSRF_STORAGE_KEY = 'fosales_csrf'
const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
const ACCESS_AT_KEY = 'fosales_access_at'
const ACCESS_TTL_MS = 15 * 60_000
const REFRESH_MARGIN_MS = 60_000
const ISSUES_ACCESS = new Set(['/api/auth/login', '/api/auth/refresh', '/api/auth/change-password'])
const NO_REFRESH = new Set(['/api/auth/login', '/api/auth/refresh', '/api/auth/forgot-password', '/api/auth/reset-password'])

let onUnauthorized: () => void = () => undefined
let refreshing: Promise<boolean> | null = null

export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler
}

const readCookie = (name: string) => {
  const pair = document.cookie.split('; ').find((item) => item.startsWith(`${name}=`))
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : undefined
}

const csrfToken = () => {
  try {
    return readCookie(CSRF_COOKIE) ?? localStorage.getItem(CSRF_STORAGE_KEY) ?? undefined
  } catch {
    return undefined
  }
}

const rememberCsrf = (data: unknown) => {
  const token = (data as { csrfToken?: unknown } | null)?.csrfToken
  if (typeof token !== 'string') return
  try {
    localStorage.setItem(CSRF_STORAGE_KEY, token)
  } catch {
    return
  }
}

const markAccessIssued = () => {
  try {
    localStorage.setItem(ACCESS_AT_KEY, String(Date.now()))
  } catch {
    return
  }
}

const accessNearExpiry = () => {
  try {
    const issuedAt = Number(localStorage.getItem(ACCESS_AT_KEY))
    return issuedAt > 0 && Date.now() - issuedAt > ACCESS_TTL_MS - REFRESH_MARGIN_MS
  } catch {
    return false
  }
}

export const clearCsrf = () => {
  try {
    localStorage.removeItem(CSRF_STORAGE_KEY)
    localStorage.removeItem(ACCESS_AT_KEY)
  } catch {
    return
  }
}

const buildUrl = (path: string, params?: RequestOptions['params']) => {
  const url = new URL(path, API_BASE_URL || window.location.origin)
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
  })
  return url.toString()
}

function send(path: string, { body, params, headers, method = 'GET', ...init }: RequestOptions) {
  const isForm = body instanceof FormData
  const csrf = MUTATING.has(method.toUpperCase()) ? csrfToken() : undefined
  return fetch(buildUrl(path, params), {
    ...init,
    method,
    credentials: 'include',
    headers: {
      ...(body !== undefined && !isForm ? { 'Content-Type': 'application/json' } : {}),
      ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  })
}

async function parse(res: Response) {
  if (res.status === 204) return undefined
  return res.headers.get('content-type')?.includes('application/json') ? res.json() : res.text()
}

async function runRefresh(force: boolean) {
  const exec = async () => {
    if (!force && !accessNearExpiry()) return true
    const res = await send('/api/auth/refresh', { method: 'POST' })
    if (res.ok) {
      rememberCsrf(await parse(res))
      markAccessIssued()
    }
    return res.ok
  }
  try {
    return 'locks' in navigator ? await navigator.locks.request('fosales-auth-refresh', exec) : await exec()
  } catch {
    return false
  }
}

const refreshSession = (force = true) => {
  refreshing ??= runRefresh(force).finally(() => {
    refreshing = null
  })
  return refreshing
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!NO_REFRESH.has(path) && accessNearExpiry()) await refreshSession(false)
  let res = await send(path, options)
  if (res.status === 401 && !NO_REFRESH.has(path)) {
    if (await refreshSession()) res = await send(path, options)
    if (res.status === 401) onUnauthorized()
  }

  const data = await parse(res)
  if (!res.ok) {
    const message = (data as { message?: string } | undefined)?.message ?? res.statusText
    throw new HttpError(res.status, message, data)
  }
  rememberCsrf(data)
  if (ISSUES_ACCESS.has(path)) markAccessIssued()
  return data as T
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, { ...options, body, method: 'POST' }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, { ...options, body, method: 'PUT' }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, { ...options, body, method: 'PATCH' }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'DELETE' }),
}

export const errorMessage = (error: unknown, fallback = 'Không kết nối được máy chủ, vui lòng thử lại') =>
  error instanceof HttpError ? error.message : fallback

export const sleep = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))
