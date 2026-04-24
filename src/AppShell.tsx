import { useEffect, useState } from 'react'
import { AuthModal } from './features/auth/AuthModal'
import { RideBoard } from './features/rides/RideBoard'
import { InterestModal, type InterestSubmission } from './features/rides/InterestModal'
import { ProfilePanel } from './features/profile/ProfilePanel'
import { AdminPanel } from './features/admin/AdminPanel'
import { HeroIntro } from './features/home/HeroIntro'
import { MobileTabBar } from './features/layout/MobileTabBar'
import { useAppStore } from './lib/useAppStore'
import { useViewport } from './lib/useViewport'
import { avatarColor, avatarInitial } from './lib/avatar'
import type { Ride } from './types'

type Tab = 'rides' | 'profile'
type AuthOpen = 'signup' | 'login' | null

export function AppShell() {
  const { data, currentUser, usersById, helpers, setData } = useAppStore()
  const { isMobile } = useViewport()
  const [tab, setTab] = useState<Tab>('rides')
  const [authOpen, setAuthOpen] = useState<AuthOpen>(null)
  const [interestRide, setInterestRide] = useState<Ride | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [devOpen, setDevOpen] = useState(false)

  useEffect(() => {
    helpers.expireRides()
  }, [data?.rides.length])

  useEffect(() => {
    if (!isMobile) setMenuOpen(false)
  }, [isMobile])

  useEffect(() => {
    if (tab === 'profile' && !currentUser) {
      setTab('rides')
      setAuthOpen('login')
    }
  }, [tab, currentUser])

  if (!data) return <div className="app">Loading...</div>

  function openAuth(mode: 'signup' | 'login') {
    setAuthOpen(mode)
    setMenuOpen(false)
  }

  const brand = (
    <div className="topbar__brand">
      <span className="topbar__logo" aria-hidden>◎</span>
      <div>
        <p className="eyebrow">UIUC ↔ Chicago</p>
        <h1>Uni Hitch Match</h1>
      </div>
    </div>
  )

  const desktopNav = (
    <nav className="topbar__nav" aria-label="Primary">
      <button
        type="button"
        className={tab === 'rides' ? 'topbar__tab is-active' : 'topbar__tab'}
        onClick={() => setTab('rides')}
      >
        Ride board
      </button>
      {currentUser && (
        <button
          type="button"
          className={tab === 'profile' ? 'topbar__tab is-active' : 'topbar__tab'}
          onClick={() => setTab('profile')}
        >
          Profile
        </button>
      )}
    </nav>
  )

  const authCluster = currentUser ? (
    <div className="topbar__auth">
      <button
        type="button"
        className="topbar__me"
        onClick={() => setTab('profile')}
        title="Open profile"
      >
        <span className="topbar__avatar" style={{ background: avatarColor(currentUser.handle) }}>
          {avatarInitial(currentUser.name || currentUser.handle)}
        </span>
        <span className="topbar__me-handle">@{currentUser.handle}</span>
      </button>
      <button type="button" className="btn btn--ghost btn--sm" onClick={helpers.logout}>
        Logout
      </button>
    </div>
  ) : (
    <div className="topbar__auth">
      <button type="button" className="btn btn--ghost btn--sm" onClick={() => openAuth('login')}>
        Login
      </button>
      <button type="button" className="btn btn--primary btn--sm" onClick={() => openAuth('signup')}>
        Sign Up
      </button>
    </div>
  )

  return (
    <div className={'app' + (isMobile ? ' app--mobile' : '')}>
      <header className={'topbar' + (isMobile ? ' topbar--mobile' : '')}>
        {brand}
        {isMobile ? (
          <button
            type="button"
            className="topbar__menu"
            aria-label="Open menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        ) : (
          <>
            {desktopNav}
            {authCluster}
          </>
        )}
      </header>

      {isMobile && menuOpen && (
        <div className="topbar__drawer">
          {currentUser ? (
            <div className="topbar__drawer-me">
              <span className="topbar__avatar topbar__avatar--lg" style={{ background: avatarColor(currentUser.handle) }}>
                {avatarInitial(currentUser.name || currentUser.handle)}
              </span>
              <div>
                <p className="topbar__drawer-name">{currentUser.name || '—'}</p>
                <p className="topbar__drawer-handle">@{currentUser.handle}</p>
              </div>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => { helpers.logout(); setMenuOpen(false) }}>
                Logout
              </button>
            </div>
          ) : (
            <div className="topbar__drawer-auth">
              <button type="button" className="btn btn--primary" onClick={() => openAuth('signup')}>
                Sign Up
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => openAuth('login')}>
                Login
              </button>
            </div>
          )}
        </div>
      )}

      {authOpen && (
        <AuthModal
          mode={authOpen}
          onClose={() => setAuthOpen(null)}
          onLogin={(email) => {
            const ok = helpers.loginByEmail(email)
            if (ok) setAuthOpen(null)
            return ok
          }}
          onSignup={(payload) => {
            const result = helpers.signup(payload)
            if (result.ok) setAuthOpen(null)
            return result
          }}
          onSwitchMode={(m) => setAuthOpen(m)}
        />
      )}

      {interestRide && (
        <InterestModal
          ride={interestRide}
          currentUser={currentUser}
          owner={usersById.get(interestRide.ownerUserId) ?? null}
          onClose={() => setInterestRide(null)}
          onRequestAuth={(mode) => setAuthOpen(mode)}
          onSubmit={(submission: InterestSubmission) =>
            helpers.submitInterest(interestRide, submission)
          }
        />
      )}

      <main className={'app__main' + (isMobile ? ' app__main--mobile' : '')}>
        {tab === 'rides' && (
          <>
            <HeroIntro rides={data.rides} />
            <div>
              <RideBoard
                rides={data.rides}
                currentUser={currentUser}
                usersById={usersById}
                onCreateRide={helpers.createRide}
                onInterested={(ride) => {
                  setInterestRide(ride)
                }}
                onRepost={helpers.repostRide}
              />
            </div>
            <details className="dev-tools" open={devOpen} onToggle={(e) => setDevOpen(e.currentTarget.open)}>
              <summary>Developer tools (seed data)</summary>
              <div className="dev-tools__row">
                <button type="button" className="btn btn--ghost btn--sm" onClick={helpers.replaceSeeds}>
                  Replace with 20 + 20 test posts
                </button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={helpers.appendSeeds}>
                  Append 20 + 20 test posts
                </button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={helpers.clearRides}>
                  Clear all posts
                </button>
              </div>
            </details>
          </>
        )}

        {tab === 'profile' && currentUser && (
          <>
            <ProfilePanel
              currentUser={currentUser}
              rides={data.rides}
              onUpdate={(patch) =>
                setData((prev) =>
                  prev
                    ? {
                        ...prev,
                        users: prev.users.map((u) =>
                          currentUser && u.id === currentUser.id ? { ...u, ...patch } : u,
                        ),
                      }
                    : prev,
                )
              }
              onRequestLogin={() => openAuth('login')}
            />
            {currentUser.isAdmin && (
              <AdminPanel
                currentUser={currentUser}
                users={data.users}
                auditEvents={data.auditEvents}
                notificationEvents={data.notificationEvents}
              />
            )}
          </>
        )}
      </main>

      {isMobile && (
        <MobileTabBar
          current={tab}
          onChange={(t) => setTab(t)}
          showProfile={!!currentUser}
          onRequestAuth={() => openAuth('login')}
        />
      )}
    </div>
  )
}
