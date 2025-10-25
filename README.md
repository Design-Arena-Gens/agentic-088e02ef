# Agentic Notion

A minimal Notion-like page connected to a SQLite database using Next.js App Router and Prisma.

## Scripts
- `npm run dev` — start dev server
- `npm run build && npm start` — production build and start
- `npm run prisma:push` — create/update SQLite schema
- `npm run seed` — seed example data

## Environment
- `DATABASE_URL` defaults to `file:./dev.db` via `.env`
