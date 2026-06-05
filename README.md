# frame

[![Lint](https://github.com/allandominguez/frame-app/actions/workflows/lint.yml/badge.svg)](https://github.com/allandominguez/frame-app/actions/workflows/lint.yml)
[![Test](https://github.com/allandominguez/frame-app/actions/workflows/test.yml/badge.svg)](https://github.com/allandominguez/frame-app/actions/workflows/test.yml)

> **Status:** 🚧 Early-stage — foundation and environment setup in progress.

A private, local-first daily photo journal. Capture one moment per day, with an optional note. All data lives on-device; no account required.

**_One photo. One note. One day._**

> This repository contains the **mobile app** (React Native / Expo). An optional self-hosted sync service (`frame-sync`) is planned but not yet developed.

---

## Key Features (Planned)

- **One photo per day** — A single focused capture with optional text note
- **Calendar view** — Monthly grid with photo thumbnails at a glance
- **Streak tracker** — Current and longest capture streaks to reinforce the daily habit
- **Local-first** — All data stored on-device; works entirely offline
- **Daily reminders** — Time-based and location-based (geofence exit from home)
- **Google Drive backup** — Direct backup and restore from within the app
- **Optional sync** — Self-hosted Go service for multi-device sync (advanced users)

---

## Tech Stack

**Mobile:**

- React Native (Expo ~54)
- TypeScript (strict mode)
- React Navigation
- SQLite via `expo-sqlite`
- Secure credential storage via `expo-secure-store`

**Sync service:** (planned — not yet developed)

- Go
- Docker (multi-arch: amd64 + arm64 for NAS distribution)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or v20 (LTS)
- [Expo Go](https://expo.dev/go) on your Android device, or a connected Android device with USB debugging enabled

### Installation

```bash
# Clone the repo
git clone https://github.com/allandominguez/frame-app.git
cd frame-app

# Install dependencies
npm ci
```

### Running the app

```bash
npm start      # prompts to choose platform
npm run android  # Android directly
```

---

## Project Structure

```
frame-app/
├── features/
│   └── <name>/             # One folder per feature
│       ├── components/     # Screens and UI components
│       ├── hooks/          # Feature-specific hooks
│       └── types.ts        # Feature-specific types
├── lib/                    # Shared infrastructure (storage helpers, utilities)
├── navigation/             # React Navigation root and stack definitions
├── assets/
├── App.tsx                 # Root component, mounts navigation
├── index.ts                # Expo entry point
└── app.json
```

---

## Branching

| Branch                       | Purpose                                        |
| ---------------------------- | ---------------------------------------------- |
| `main`                       | Production-ready code                          |
| `add/desc`, `update/desc`    | New features                                   |
| `fix/desc`                   | Bug fixes                                      |
| `chore/desc`, `improve/desc` | Maintenance tasks (dependencies, config, etc.) |

---

## Development

```bash
npm run lint       # ESLint on .ts/.tsx
npm run typecheck  # tsc --noEmit
npm test           # Jest
```

Pre-commit hooks run gitleaks (secrets scanning) and lint-staged (ESLint --fix, Prettier) on staged files.

---

## Project Goals

frame is a portfolio piece demonstrating full-stack mobile product development — from local data modelling and camera APIs through to an optional self-hosted sync service in Go.

### Product-Focused Thinking

- Designing a minimal, habit-forming capture experience with intentional constraints
- Building a local-first architecture that eliminates entire classes of bugs (no sync conflicts, no offline error states, no auth flows for the core flow)
- Making deliberate UX decisions: one photo per day, calendar-centric navigation, streak reinforcement, unobtrusive reminders

### Technical Skills

- Mobile app development with React Native (Expo) and TypeScript
- On-device SQLite data modelling and typed data access layer
- Camera, gallery, and EXIF metadata APIs
- Secure credential storage with `expo-secure-store`
- Background tasks and geofencing with `expo-location`
- Google Drive OAuth and file backup via `expo-auth-session`
- Go service development: REST API, Docker, multi-arch builds

### Professional Practices

- Clean git history and meaningful commits
- Behaviour-driven tests with Jest and React Native Testing Library
- Code quality automation (ESLint, Prettier, Husky, lint-staged, gitleaks)
- CI/CD pipeline with GitHub Actions
- TypeScript strict mode throughout
- Feature-cohesion folder structure

---

## Contributing

This is a personal portfolio project — PRs aren't expected, but feedback and suggestions are welcome.

### Code style

- TypeScript throughout — `any` is a lint error
- Prettier and ESLint are configured — format on save is recommended
- Business logic in hooks, rendering in components

---

## Contact

**Allan Dominguez**
[Portfolio](https://allandominguez.dev/) | [GitHub](https://github.com/allandominguez) | [LinkedIn](https://www.linkedin.com/in/allan-dominguez-113625146/) | [Email](mailto:allan.c.dominguez@gmail.com)

_This project is part of my portfolio demonstrating full-stack mobile product development._

---

## License

MIT License — see [LICENSE](LICENSE) file for details.
