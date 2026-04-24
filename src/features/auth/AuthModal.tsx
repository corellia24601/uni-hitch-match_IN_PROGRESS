import { useState } from 'react'
import { formatPhone, phoneDigits } from '../../lib/format'
import { useViewport } from '../../lib/useViewport'
import type { User } from '../../types'

type Mode = 'signup' | 'login'

type Props = {
  mode: Mode
  onClose: () => void
  onLogin: (email: string) => boolean
  onSignup: (payload: {
    email: string
    name: string
    phone: string
    bio: string
  }) => { ok: boolean; reason?: string; user?: User }
  onSwitchMode?: (mode: Mode) => void
}

export function AuthModal({ mode, onClose, onLogin, onSignup, onSwitchMode }: Props) {
  const { isMobile } = useViewport()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')

  const [emailCode, setEmailCode] = useState('')
  const [emailCodeSent, setEmailCodeSent] = useState<string | null>(null)
  const [emailVerified, setEmailVerified] = useState(false)

  const [msg, setMsg] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function sendEmailCode() {
    if (!/@illinois\.edu$/i.test(email.trim())) {
      setMsg('School email must end with @illinois.edu')
      return
    }
    const code = String(Math.floor(100000 + Math.random() * 900000))
    setEmailCodeSent(code)
    setEmailVerified(false)
    setMsg(`Email code sent. (Demo — code is: ${code})`)
  }

  function verifyEmailCode() {
    if (!emailCodeSent || emailCode.trim() !== emailCodeSent) {
      setMsg('Incorrect email code.')
      return
    }
    setEmailVerified(true)
    setMsg('Email verified.')
  }

  function submit() {
    setMsg(null)
    if (!emailVerified) {
      setMsg('Please verify your email first.')
      return
    }
    if (mode === 'login') {
      const ok = onLogin(email.trim())
      if (ok) {
        setSuccess(true)
        setTimeout(onClose, 800)
      } else {
        setMsg('No account found for this email. Sign up first.')
      }
      return
    }
    if (!name.trim()) {
      setMsg('Name is required.')
      return
    }
    if (phoneDigits(phone).length !== 10) {
      setMsg('Please enter a valid 10-digit phone number.')
      return
    }
    const result = onSignup({ email, name, phone, bio })
    if (result.ok) {
      setSuccess(true)
      setTimeout(onClose, 800)
    } else {
      const reasons: Record<string, string> = {
        email: 'Invalid or non-@illinois.edu email.',
        phone: 'Phone must be 10 digits.',
        name: 'Name is required.',
        exists: 'An account already exists for this email. Use login.',
      }
      setMsg(reasons[result.reason ?? ''] ?? `Sign up failed (${result.reason}).`)
    }
  }

  const isSignup = mode === 'signup'
  const title = isSignup ? 'Sign up only takes 10s' : 'Login'
  const subtitle = isSignup
    ? 'Your email and phone number will be hidden unless you opt to exchange contacts with others.'
    : 'No password. Every login uses a fresh code sent to your school email.'

  const phoneValid = phoneDigits(phone).length === 10

  return (
    <div
      className={'modal-overlay' + (isMobile ? ' modal-overlay--sheet' : '')}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={'modal-box auth-modal' + (isMobile ? ' auth-modal--sheet' : '')}>
        <div className="auth-modal__head">
          <div>
            <h2>{title}</h2>
            <p className={'auth-modal__sub' + (isSignup ? ' auth-modal__sub--highlight' : '')}>
              {subtitle}
            </p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {success && <p className="form-success">Success! Closing...</p>}

        {!success && (
          <div className="auth-steps">
            <AuthStep step={1} label={isSignup ? 'U of I email only' : 'School email'} done={emailVerified}>
              <div className="row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setEmailVerified(false)
                    setEmailCodeSent(null)
                  }}
                  placeholder="netid@illinois.edu"
                  disabled={emailVerified}
                />
                {!emailVerified && (
                  <button type="button" className="btn btn--ghost btn--sm" onClick={sendEmailCode}>
                    Send code
                  </button>
                )}
              </div>
              {emailCodeSent && !emailVerified && (
                <div className="row" style={{ marginTop: '0.5rem' }}>
                  <input
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    placeholder="6-digit email code"
                    inputMode="numeric"
                  />
                  <button type="button" className="btn btn--primary btn--sm" onClick={verifyEmailCode}>
                    Verify
                  </button>
                </div>
              )}
            </AuthStep>

            {isSignup && (
              <AuthStep
                step={2}
                label="Phone number (make sure it's reachable for your drivers and passengers)"
                done={phoneValid}
              >
                <div className="row">
                  <input
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="(XXX)-XXX-XXXX"
                    inputMode="tel"
                  />
                </div>
              </AuthStep>
            )}

            {isSignup && (
              <AuthStep
                step={3}
                label="Profile"
                done={name.trim().length > 0}
                note="Shown to other riders so they know who is joining."
              >
                <div className="form__grid">
                  <label className="field">
                    <span className="label">Name (required)</span>
                    <input value={name} onChange={(e) => setName(e.target.value)} />
                  </label>
                  <label className="field">
                    <span className="label">Bio (optional)</span>
                    <input
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="MechE junior, weekends in Chicago"
                    />
                  </label>
                </div>
              </AuthStep>
            )}

            {msg && <p className="form-error" style={{ marginTop: '0.75rem' }}>{msg}</p>}

            <div className="form__actions auth-modal__actions">
              <button type="button" className="btn btn--primary" onClick={submit}>
                {isSignup ? 'Create account →' : 'Login →'}
              </button>
              {onSwitchMode && (
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => onSwitchMode(isSignup ? 'login' : 'signup')}
                >
                  {isSignup ? 'I already have an account' : 'New — create account'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AuthStep({
  step,
  label,
  done,
  note,
  children,
}: {
  step: number
  label: string
  done: boolean
  note?: string
  children: React.ReactNode
}) {
  return (
    <div className={'auth-step' + (done ? ' auth-step--done' : '')}>
      <div className="auth-step__header">
        <span className="auth-step__num">{done ? '✓' : step}</span>
        <div className="auth-step__heading">
          <p className="auth-step__label">
            Step {step} — {label}
            {done && <span className="badge badge--ok"> Ready</span>}
          </p>
          {note && <p className="auth-step__note">{note}</p>}
        </div>
      </div>
      <div className="auth-step__body">{children}</div>
    </div>
  )
}
