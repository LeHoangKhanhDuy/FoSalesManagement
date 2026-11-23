import { useEffect, useState, type KeyboardEvent } from 'react'
import { authService } from '@/modules/auth/services/auth.service'
import { authStore, LOCK_SECONDS, MAX_ATTEMPTS } from '@/modules/auth/utils/auth.utils'

type Errors = Partial<Record<'username' | 'password' | 'form', string>>

export function useLoginForm(onSuccess: () => void) {
  const [username, setUsername] = useState(() => authStore.lastUsername())
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  const lockLeft = Math.max(0, Math.ceil((lockedUntil - now) / 1000))

  useEffect(() => {
    if (!lockedUntil) return
    const t = setInterval(() => {
      setNow(Date.now())
      if (Date.now() >= lockedUntil) {
        setLockedUntil(0)
        setAttempts(0)
        setErrors({})
      }
    }, 500)
    return () => clearInterval(t)
  }, [lockedUntil])

  const detectCaps = (e: KeyboardEvent) => setCapsLock(e.getModifierState?.('CapsLock') ?? false)

  const fill = (u: string, p: string) => {
    setUsername(u)
    setPassword(p)
    setErrors({})
  }

  const submit = async () => {
    if (loading || lockLeft) return
    const e: Errors = {}
    if (!username.trim()) e.username = 'Nhập tên đăng nhập hoặc số điện thoại'
    if (!password) e.password = 'Nhập mật khẩu'
    else if (password.length < 6) e.password = 'Mật khẩu tối thiểu 6 ký tự'
    setErrors(e)
    if (Object.keys(e).length) return
    setLoading(true)
    try {
      const session = await authService.login({ username, password, remember })
      authStore.set(session, remember)
      onSuccess()
    } catch (err) {
      const next = attempts + 1
      setAttempts(next)
      setPassword('')
      if (next >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCK_SECONDS * 1000)
        setNow(Date.now())
        setErrors({ form: `Sai quá ${MAX_ATTEMPTS} lần. Vui lòng thử lại sau ${LOCK_SECONDS} giây.` })
      } else {
        setErrors({ form: `${err instanceof Error ? err.message : 'Đăng nhập thất bại'} (còn ${MAX_ATTEMPTS - next} lần thử)` })
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    username,
    password,
    remember,
    showPassword,
    capsLock,
    errors,
    loading,
    lockLeft,
    setUsername: (v: string) => {
      setUsername(v)
      setErrors((x) => ({ ...x, username: undefined, form: lockLeft ? x.form : undefined }))
    },
    setPassword: (v: string) => {
      setPassword(v)
      setErrors((x) => ({ ...x, password: undefined, form: lockLeft ? x.form : undefined }))
    },
    setRemember,
    toggleShowPassword: () => setShowPassword((v) => !v),
    detectCaps,
    fill,
    submit,
  }
}
