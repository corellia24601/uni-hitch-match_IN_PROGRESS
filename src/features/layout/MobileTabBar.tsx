type Tab = 'rides' | 'profile'

type Props = {
  current: Tab
  onChange: (tab: Tab) => void
  showProfile: boolean
  onRequestAuth?: () => void
}

export function MobileTabBar({ current, onChange, showProfile, onRequestAuth }: Props) {
  return (
    <nav className="mobile-tabbar" aria-label="Primary">
      <button
        type="button"
        className={'mobile-tabbar__btn' + (current === 'rides' ? ' is-active' : '')}
        onClick={() => onChange('rides')}
      >
        <span className="mobile-tabbar__icon" aria-hidden>▦</span>
        <span className="mobile-tabbar__label">Rides</span>
      </button>

      <button
        type="button"
        className={'mobile-tabbar__btn' + (current === 'profile' ? ' is-active' : '')}
        onClick={() => {
          if (!showProfile && onRequestAuth) onRequestAuth()
          else onChange('profile')
        }}
      >
        <span className="mobile-tabbar__icon" aria-hidden>{showProfile ? '☺' : '🔑'}</span>
        <span className="mobile-tabbar__label">{showProfile ? 'Profile' : 'Sign in'}</span>
      </button>
    </nav>
  )
}
