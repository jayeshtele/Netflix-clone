# Netflix Clone

A responsive Netflix-style streaming UI built with React, Vite, Tailwind CSS, Redux Toolkit, React Redux, and React Router.

## Features

- Responsive home page with hero banner, carousel rows, ranked titles, and continue-watching progress.
- Browse pages for TV Shows, Movies, and New & Popular with genre filtering and sorting.
- Live RapidAPI catalog loading through a Netlify function, with local demo data as a fallback.
- Search page for titles, cast, genres, moods, and creator names.
- Title detail pages with similar-title recommendations.
- My List state managed with Redux Toolkit.
- Preview modal with embedded trailers, profile menu, mobile navigation, and mute/list controls.
- Netlify SPA routing via `netlify.toml`.

## RapidAPI setup

The app uses the RapidAPI IMDb catalog host by default:

```bash
RAPIDAPI_KEY=your_key
RAPIDAPI_HOST=imdb236.p.rapidapi.com
```

For local Vite-only testing, copy `.env.example` to `.env.local` and set `VITE_RAPIDAPI_KEY`. For deployed Netlify builds, set `RAPIDAPI_KEY` in Netlify environment variables so the browser calls `/.netlify/functions/catalog` without exposing the key.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

## Netlify

Build command:

```bash
npm run build
```

Publish directory:

```bash
dist
```

Continuous deployment can be connected to the GitHub repository so every pushed commit triggers a fresh Netlify build.
