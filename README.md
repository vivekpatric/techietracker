# 75-Day Backend + DSA Quest Log — React

React/Vite migration of the existing Quest Log. The existing Supabase `user_data` table and JSON state shape are preserved.

## Stack
- React + Vite
- Supabase JS
- Existing custom CSS / visual design

## Run
```bash
npm install
npm run dev
```

## Structure
- `src/App.jsx` — React application shell and event bridge
- `src/pages/renderers.js` — migrated screen rendering/actions
- `src/state.js` — state, progress, persistence
- `src/auth.js` — authentication
- `src/data/data.js` — quest data
- `src/lib/supabase.js` — Supabase client
- `src/lib/uiBus.js` — small bridge used during the migration
- `src/styles/styles.css` — existing visual styling

The existing database/table and JSON state format are intentionally preserved so the React version can use the same account data.

For a public repository, move the publishable key to Vite `VITE_` environment variables. Never put a Supabase service-role/secret key in browser code.
