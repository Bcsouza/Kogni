# Kogni — AI Creative Studio

Kogni turns ideas into Instagram-ready posts and carousels using AI. Describe what you want, pick a format and style, and Kogni generates the visual (and, for carousels, the whole structured narrative) with a consistent visual identity.

## Stack

Next.js (App Router, Turbopack) · TypeScript · Tailwind CSS v4 · shadcn/ui · Supabase (auth, database, storage) · a provider-agnostic AI layer (OpenAI today, swappable later)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). By default the app runs in **mock AI mode** — image/text generation works instantly with placeholder output and no API key required, and Supabase-backed features (auth, persistence, credits) show a "demo mode" notice until configured.

### Enabling real generation

Set these in `.env.local` (see `.env.example`):

```env
MOCK_AI_PROVIDER=false
OPENAI_API_KEY=sk-...
```

### Enabling Supabase (accounts, projects, credits, Brand Kit)

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/migrations/0001_init.sql` against it (SQL editor, or `supabase db push` with the CLI linked).
3. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

## Architecture notes

- **AI provider abstraction** (`src/lib/ai/`): the app only ever calls `getImageGenerationProvider()` / `getTextGenerationProvider()`. Adding a new model provider means writing one file in `src/lib/ai/providers/` and adding one branch in `src/lib/ai/provider.ts` — no application code changes.
- **Credits** are an append-only ledger (`credit_transactions`), read and written only through server-side code with the Supabase service role — the client can never forge a balance.
- **Carousel identity**: all slides in a carousel share one enhanced base prompt so palette, lighting and composition stay consistent across the set.

## Scripts

```bash
npm run dev     # start the dev server
npm run build   # production build (also type-checks)
npm run lint    # eslint
```
