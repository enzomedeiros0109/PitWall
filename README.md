# PitWall

PitWall is a Formula 1 dashboard for the current season's race schedule, Grand Prix weekends, championship standings, and driver results. It is built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui components.

## Features

- Browse the season schedule and open each Grand Prix weekend.
- View practice, qualifying, and race session results when available.
- Check driver and team championship standings after completed races.
- Open driver profiles with team details, championship position, and a season-long table of qualifying positions, race finishes, and points.
- Follow driver result rows to profiles and Grand Prix rows to their weekend pages.

## Data sources

- [Jolpica F1 API](https://github.com/jolpica/jolpica-f1/blob/main/docs/README.md) provides the race schedule, driver details, qualifying results, and race results.
- [OpenF1](https://openf1.org/docs/) provides meeting and session details, session results, driver and team information, and championship standings.

The app requests both APIs directly from the browser. No environment variables are needed for the current setup.

## Getting started

Install Node.js and pnpm, then run:

```bash
pnpm install
pnpm dev
```

Open the local URL provided by Vite

## Routes

| Path | Page |
| --- | --- |
| `/` | Current season schedule and standings. |
| `/grand-prix/:season/:round` | Grand Prix weekend and session results. |
| `/driver/:season/:driverSlug` | Driver profile and season results. |

## Project structure

- `src/main.tsx` sets up React Query and the browser router; `src/App.tsx` defines the routes.
- `src/pages/` contains the home, Grand Prix, and driver pages.
- `src/components/grand-prix/` and `src/components/standings/` contain feature components; `src/components/ui/` contains shared UI components.
- `src/api/` contains the Jolpica and OpenF1 clients; `src/schemas/` validates their responses.
- `src/lib/`, `src/data/`, and `src/hooks/` contain shared helpers, image mappings, and hooks.
- `src/assets/` contains the logo, background, and circuit images.
