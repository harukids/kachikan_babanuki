-- 価値観ババ抜き MVP schema（何度実行しても大丈夫な版）
-- Supabase SQL Editor で実行してください。
-- 部屋コード＝招待券。一覧なし。MVPは緩いポリシー。

create table if not exists rooms (
  code text primary key,
  phase text not null default 'LOBBY',
  seat_order text[] not null default '{}',
  current_player_id text,
  sub_state text,
  pending_card_id text,
  deny_count int not null default 0,
  denied_card_ids text[] not null default '{}',
  host_id text not null,
  field text[] not null default '{}',
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  room_code text not null references rooms(code) on delete cascade,
  display_name text not null,
  seat_index int,
  hand text[] not null default '{}',
  turns_completed int not null default 0,
  main_card_id text,
  sub_card_ids text[] not null default '{}',
  reason text,
  ready_selecting boolean not null default false,
  ready_writing boolean not null default false,
  is_host boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists players_room_code_idx on players(room_code);

alter table rooms enable row level security;
alter table players enable row level security;

-- 既存ポリシーがあってもやり直せるように一度消す
drop policy if exists "rooms_all_anon" on rooms;
drop policy if exists "players_all_anon" on players;

-- MVP: anon が部屋コードを知っていれば読み書き可（招待券モデル）
create policy "rooms_all_anon" on rooms
  for all to anon using (true) with check (true);

create policy "players_all_anon" on players
  for all to anon using (true) with check (true);

-- Realtime（すでに追加済みならエラーになることがあるので、その場合は無視してOK）
do $$
begin
  alter publication supabase_realtime add table rooms;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table players;
exception
  when duplicate_object then null;
end $$;
