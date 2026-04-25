-- Admin moderation: extend RLS so is_admin users can manage all rides and read all notifications.
-- Apply after 20260421_full_expansion.sql. Run in Supabase SQL Editor or via supabase db push.

drop policy if exists "rides admin update" on rides;
drop policy if exists "rides admin delete" on rides;
drop policy if exists "notification_events admin read" on notification_events;

-- Rides: admins may update or delete any row (owners still use existing "rides owner write").
create policy "rides admin update" on rides
for update using (
  exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true)
);

create policy "rides admin delete" on rides
for delete using (
  exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true)
);

-- Notification queue: admins can read everything (for moderation / debugging).
create policy "notification_events admin read" on notification_events
for select using (
  exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true)
);
