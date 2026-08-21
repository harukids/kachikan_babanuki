-- 既存プロジェクト向け: 拒否済みカード列を追加
alter table rooms
  add column if not exists denied_card_ids text[] not null default '{}';
