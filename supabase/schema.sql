-- Caerulea Vault
-- 第一版数据库结构：
-- 目标是先把你现在前端里已经存在的 Record / Item / 图片 / 标签结构落成真实数据表。
-- 这版先允许公开读取，写入权限后续接登录后再收紧。

create extension if not exists pgcrypto;

-- 分类表：
-- 对应现在网站里的 AK / HK / SV 这些大类。
create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  slug text not null unique,
  label text not null,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 档案记录表：
-- 一个 record 就是一条档案，比如 AK-000。
create table if not exists public.records (
  id uuid primary key default gen_random_uuid(),
  record_code text not null unique,
  section_id uuid not null references public.sections(id) on delete restrict,
  title text not null,
  teaser text not null default '',
  record_date date,
  share_type text not null default 'count' check (share_type in ('count', 'headcount')),
  share_round_1 numeric(10, 2) not null default 0,
  share_round_2 numeric(10, 2),
  shipping numeric(10, 2) not null default 0,
  status text not null check (status in ('planned', 'active', 'archived', 'restart_planned')),
  stage text not null default 'draft_ready',
  notes text not null default '',
  private_notes text not null default '',
  total_quantity integer,
  advance_paid numeric(10, 2),
  remaining_stock integer,
  profit_loss numeric(10, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists records_section_id_idx on public.records(section_id);
create index if not exists records_record_date_idx on public.records(record_date desc);
create index if not exists records_status_idx on public.records(status);

-- 记录图片表：
-- 对应宣图 / 打样 / 大货 / 返图。
create table if not exists public.record_images (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.records(id) on delete cascade,
  image_kind text not null check (image_kind in ('promo', 'sample', 'bulk', 'result')),
  label text not null,
  image_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (record_id, image_kind, sort_order)
);

create index if not exists record_images_record_id_idx on public.record_images(record_id);

-- 具体物品表：
-- 一个 record 下面可以有多个 item，比如 AK-001-1、AK-001-2。
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  item_code text not null unique,
  record_id uuid not null references public.records(id) on delete cascade,
  title text not null,
  note text not null default '',
  unit_price numeric(10, 2) not null default 0,
  image_path text,
  image_fit text not null default 'cover' check (image_fit in ('cover', 'contain')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists items_record_id_idx on public.items(record_id);

-- 标签表：
-- 统一放普通标签、角色标签、状态标签，靠 tag_type 区分。
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  tag_type text not null default 'generic' check (tag_type in ('generic', 'character', 'status')),
  created_at timestamptz not null default now()
);

-- record 和 tag 的多对多关系。
create table if not exists public.record_tags (
  record_id uuid not null references public.records(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (record_id, tag_id)
);

create index if not exists record_tags_tag_id_idx on public.record_tags(tag_id);

-- item 和 tag 的多对多关系。
create table if not exists public.item_tags (
  item_id uuid not null references public.items(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (item_id, tag_id)
);

create index if not exists item_tags_tag_id_idx on public.item_tags(tag_id);

-- 自动更新时间：
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists records_set_updated_at on public.records;
create trigger records_set_updated_at
before update on public.records
for each row
execute function public.set_updated_at();

-- 公开读取策略：
-- 先让前端可以正常把数据读出来。
create policy "Public read sections"
on public.sections
for select
to public
using (true);

create policy "Public read records"
on public.records
for select
to public
using (true);

create policy "Public read record images"
on public.record_images
for select
to public
using (true);

create policy "Public read items"
on public.items
for select
to public
using (true);

create policy "Public read tags"
on public.tags
for select
to public
using (true);

create policy "Public read record tags"
on public.record_tags
for select
to public
using (true);

create policy "Public read item tags"
on public.item_tags
for select
to public
using (true);

-- 初始分类数据：
insert into public.sections (code, slug, label, description, sort_order)
values
  ('AK', 'ak', '明日方舟', '明日方舟相关的收藏、图像记录和研究所档案条目。', 1),
  ('HK', 'hk', '空洞骑士', '空洞骑士相关的馆藏记录、物件说明和图像档案。', 2),
  ('SV', 'sv', '星露谷', '星露谷相关的展示内容、收藏记录和视觉档案。', 3),
  ('EF', 'ef', '终末地', '终末地相关的档案条目、图像样本和研究记录。', 4),
  ('NZ', 'nz', '哪吒', '哪吒相关的图像资料、藏品记录和档案说明。', 5),
  ('ZZ', 'zz', '其他', '暂未归类的补充内容，作为研究所档案的扩展区。', 6)
on conflict (code) do nothing;
