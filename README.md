# RoadmapBP

A roadmap generator that creates detailed project phases with specific, actionable tasks.

## Features

- Generate comprehensive roadmaps from minimal input
- Expands brief project descriptions into detailed plans
- Creates structured phases with concrete, actionable tasks
- Saves all generated roadmaps to Supabase for future reference
- Collects user feedback on generated roadmaps

## Supabase Integration

This project uses Supabase for data storage. To set up:

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Create the following tables:

### Roadmaps Table

```sql
create table roadmaps (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default now(),
  user_input text not null,
  expanded_brief jsonb not null,
  phases jsonb not null,
  markdowns jsonb not null,
  executive_summaries jsonb not null
);
```

### Feedback Table

```sql
create table feedback (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default now(),
  roadmap_id uuid references roadmaps(id) on delete set null,
  sentiment text not null check (sentiment in ('up', 'down')),
  email text
);

-- Add row level security policies
alter table feedback enable row level security;

-- Create policy to allow insert for anyone (anonymous users can provide feedback)
create policy "Allow anonymous insert to feedback" on feedback
  for insert
  with check (true);

-- Create policy for selecting all feedback for authenticated users
create policy "Allow authenticated users to view all feedback" on feedback
  for select
  using (true);

-- Create index on roadmap_id for faster lookups
create index feedback_roadmap_id_idx on feedback (roadmap_id);
```

4. Get your Supabase URL and anon key from your project settings
5. Create a `.env.local` file at the root of your project with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Supabase as described above
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file in the root directory with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the placeholder values with your actual Supabase credentials. 