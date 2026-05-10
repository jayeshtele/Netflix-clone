# Netflix Clone

A responsive Netflix-style streaming UI built with React, Vite, Tailwind CSS, Redux Toolkit, React Redux, and React Router.

## Features

- Responsive home page with hero banner, carousel rows, ranked titles, and continue-watching progress.
- Browse pages for TV Shows, Movies, and New & Popular with genre filtering and sorting.
- Live Netflix availability catalog loading through RapidAPI's Streaming Availability API, with local demo data as a fallback.
- Search page for titles, cast, genres, moods, and creator names.
- Title detail pages with similar-title recommendations.
- My List state managed with Redux Toolkit.
- Preview modal with embedded trailers, profile menu, mobile navigation, and mute/list controls.
- Netlify SPA routing via `netlify.toml`.

## RapidAPI setup

Netflix does not provide a public official catalog API for this kind of clone. This project uses RapidAPI's Streaming Availability API and filters the catalog to Netflix titles for the configured country.

```bash
RAPIDAPI_KEY=your_key
RAPIDAPI_HOST=streaming-availability.p.rapidapi.com
NETFLIX_COUNTRY=in
NETFLIX_CATALOG=netflix
```

For local Vite-only testing, copy `.env.example` to `.env.local` and set `VITE_RAPIDAPI_KEY`. For deployed Netlify builds, set `RAPIDAPI_KEY` in Netlify environment variables so the browser calls `/.netlify/functions/catalog` without exposing the key. Change `NETFLIX_COUNTRY` or `VITE_NETFLIX_COUNTRY` to another ISO country code, such as `us`, `gb`, or `jp`, to mirror a different Netflix region.

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
