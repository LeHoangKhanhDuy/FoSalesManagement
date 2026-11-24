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
const JUST_ISSUED_MS = 10_000
const LOGOUT_PATH = '/api/auth/logout'
const INVALID_MEMO_MS = 5_000
const ISSUES_ACCESS = new Set(['/api/auth/login', '/api/auth/refresh', '/api/auth/change-password'])
const NO_REFRESH = new Set(['/api/auth/login', '/api/auth/refresh', '/api/auth/forgot-password', '/api/auth/reset-password'])

let onUnauthorized: () => void = () => undefined
type RefreshResult = 'ok' | 'invalid' | 'failed'

let refreshing: Promise<RefreshResult> | null = null
let invalidUntil = 0

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
  invalidUntil = 0
  try {
    localStorage.setItem(ACCESS_AT_KEY, String(Date.now()))
  } catch {
    return
  }
}

const accessAge = () => {
  try {
    const issuedAt = Number(localStorage.getItem(ACCESS_AT_KEY))
    return issuedAt > 0 ? Date.now() - issuedAt : null
  } catch {
    return null
  }
}

const accessNearExpiry = () => {
  const age = accessAge()
  return age !== null && age > ACCESS_TTL_MS - REFRESH_MARGIN_MS
}

const accessJustIssued = () => {
  const age = accessAge()
  return age !== null && age < JUST_ISSUED_MS
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

async function runRefresh(force: boolean): Promise<RefreshResult> {
  const exec = async (): Promise<RefreshResult> => {
    if (force ? accessJustIssued() : !accessNearExpiry()) return 'ok'
    const res = await send('/api/auth/refresh', { method: 'POST' })
    if (res.ok) {
      rememberCsrf(await parse(res))
      markAccessIssued()
      return 'ok'
    }
    return res.status === 401 || res.status === 403 ? 'invalid' : 'failed'
  }
  try {
    return 'locks' in navigator ? await navigator.locks.request('fosales-auth-refresh', exec) : await exec()
  } catch {
    return 'failed'
  }
}

const refreshSession = (force = true): Promise<RefreshResult> => {
  if (Date.now() < invalidUntil) return Promise.resolve('invalid')
  refreshing ??= runRefresh(force)
    .then((result) => {
      if (result === 'invalid') invalidUntil = Date.now() + INVALID_MEMO_MS
      return result
    })
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

const sessionExpired = (path: string) => {
  if (path !== LOGOUT_PATH) onUnauthorized()
  return new HttpError(401, 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', { code: 'SESSION_EXPIRED' })
}

const refreshFailed = () => new HttpError(503, 'Không làm mới được phiên đăng nhập, vui lòng thử lại', { code: 'REFRESH_FAILED' })

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const guarded = !NO_REFRESH.has(path)
  if (guarded && (accessNearExpiry() || Date.now() < invalidUntil)) {
    if ((await refreshSession(false)) === 'invalid') throw sessionExpired(path)
  }
  let res = await send(path, options)
  if (res.status === 401 && guarded) {
    const result = await refreshSession()
    if (result === 'invalid') throw sessionExpired(path)
    if (result === 'failed') throw refreshFailed()
    res = await send(path, options)
    if (res.status === 401) throw sessionExpired(path)
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
