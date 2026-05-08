# Netflix Clone

A responsive Netflix-style streaming UI built with React, Vite, Tailwind CSS, Redux Toolkit, React Redux, and React Router.

## Features

- Responsive home page with hero banner, carousel rows, ranked titles, and continue-watching progress.
- Browse pages for TV Shows, Movies, and New & Popular with genre filtering and sorting.
- Search page for titles, cast, genres, moods, and creator names.
- Title detail pages with similar-title recommendations.
- My List state managed with Redux Toolkit.
- Preview modal, profile menu, mobile navigation, and mute/list controls.
- Netlify SPA routing via `netlify.toml`.

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
