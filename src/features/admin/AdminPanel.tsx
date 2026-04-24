import type { AuditEvent, NotificationEvent, User } from '../../types'

type Props = {
  currentUser: User | null
  users: User[]
  auditEvents: AuditEvent[]
  notificationEvents: NotificationEvent[]
}

export function AdminPanel({ currentUser, users, auditEvents, notificationEvents }: Props) {
  if (!currentUser?.isAdmin) return null

  return (
    <section className="card admin-panel">
      <h2>Administrator View</h2>
      <p className="filters__hint">Private contacts and system logs.</p>
      <ul className="admin-list">
        {users.map((u) => (
          <li key={u.id}>
            <strong>{u.name}</strong> @{u.handle} ({u.accountNumber}) - {u.schoolEmail} -{' '}
            {u.phone}
          </li>
        ))}
      </ul>
      <h2>Recent audit events</h2>
      <ul className="admin-list">
        {auditEvents.slice(-10).map((e) => (
          <li key={e.id}>
            {e.targetType}:{e.action} ({new Date(e.createdAt).toLocaleString()})
          </li>
        ))}
      </ul>
      <h2>Notification queue</h2>
      <ul className="admin-list">
        {notificationEvents.slice(-10).map((n) => (
          <li key={n.id}>
            {n.type} to {n.recipientUserId} - {n.status}
          </li>
        ))}
      </ul>
    </section>
  )
}

