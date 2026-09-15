-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query) before migrating data.

create table if not exists players (
  id text primary key,
  name text not null,
  photo text
);

create table if not exists games (
  id text primary key,
  date timestamptz not null,
  venue text,
  access text not null default 'admin' check (access in ('admin', 'editor')),
  team_a jsonb not null,
  team_b jsonb not null
);

-- Safe to run on databases created before per-game editor access was introduced.
alter table games
  add column if not exists access text not null default 'admin'
  check (access in ('admin', 'editor'));
