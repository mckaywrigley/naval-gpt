--  RUN 1st
create extension vector;

-- RUN 2nd
create table naval (
  id bigserial primary key,
  title text,
  url text,
  date text,
  thanks text,
  content text,
  content_length bigint,
  content_tokens bigint,
  embedding vector (1536)
);

-- RUN 3rd after running the scripts
create or replace function naval_search (
  query_embedding vector(1536),
  similarity_threshold float,
  match_count int
)
returns table (
  id bigint,
  title text,
  url text,
  date text,
  thanks text,
  content text,
  content_length bigint,
  content_tokens bigint,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    naval.id,
    naval.title,
    naval.url,
    naval.date,
    naval.thanks,
    naval.content,
    naval.content_length,
    naval.content_tokens,
    1 - (naval.embedding <=> query_embedding) as similarity
  from naval
  where 1 - (naval.embedding <=> query_embedding) > similarity_threshold
  order by naval.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- RUN 4th
create index on naval
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);