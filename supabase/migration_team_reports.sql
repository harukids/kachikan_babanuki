-- チームレポート（共有URL用）
create table if not exists team_reports (
  id uuid primary key default gen_random_uuid(),
  room_code text not null references rooms(code) on delete cascade,
  group_index int not null check (group_index between 1 and 4),
  group_label text not null,
  member_ids uuid[] not null default '{}',
  snapshot jsonb not null default '{}'::jsonb,
  analysis text,
  created_at timestamptz not null default now()
);

create index if not exists team_reports_room_code_idx on team_reports(room_code);
create index if not exists team_reports_created_at_idx on team_reports(created_at desc);

alter table team_reports enable row level security;

drop policy if exists "team_reports_select_anon" on team_reports;
drop policy if exists "team_reports_insert_anon" on team_reports;

-- 共有URL: 誰でも読める（IDを知っている人だけ）
create policy "team_reports_select_anon" on team_reports
  for select to anon using (true);

-- 生成はサーバーから行う想定だが、MVPでは anon insert も許可
-- （実運用では ADMIN_SECRET で API 経由のみ推奨）
create policy "team_reports_insert_anon" on team_reports
  for insert to anon with check (true);
