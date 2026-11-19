# Coltivio

Coltivio is an open-source farm management app built with React Native and Expo. It helps farmers plan crop rotations, track harvests, manage parcels, and more.

## Tech Stack

- **React Native** (Expo SDK 58, New Architecture)
- **TypeScript** (strict mode)
- **React Navigation** for routing
- **Supabase** for auth and backend
- **TanStack Query** for data fetching
- **Zustand** for local state
- **styled-components** for styling
- **i18next** for internationalization
- **MapLibre** + Turf.js for geospatial features

## Features

- Farm and parcel management
- Crop rotation planning
- Harvest tracking
- Field calendar
- Fertilizer and crop protection logging
- Animal management
- Map-based parcel visualization
- Swiss federal plot integration (Geoadmin)

## Getting Started

### Prerequisites

- Node.js 22.13+ (CI uses 24)
- Yarn
- Xcode (for iOS) / Android Studio (for Android)
- An [Expo](https://expo.dev) account for EAS builds

### Setup

```bash
yarn install
```

Create a `.env` file with your Supabase and Google Maps keys (see `app.config.js` for required variables).

### Run

```bash
yarn ios          # iOS simulator
yarn android      # Android emulator
yarn start        # Expo dev server
```

### Other commands

```bash
yarn typecheck    # TypeScript type checking
yarn lint         # ESLint
yarn test         # Jest tests
```

### Local iOS simulator build

Builds a development client for the iOS simulator on your machine, with the environment variables from EAS:

```bash
npx eas-cli@latest build --platform ios --profile development-simulator --local
```

## Working with AI agents

The project is set up for [`@expo/agent-cli`](https://expo.dev/changelog/sdk-58), Expo's experimental CLI for coding agents (Claude Code, Codex, ...). It wraps Expo CLI, EAS CLI and expo-doctor and prints machine-readable reports and next steps.

- `AGENTS.md` (loaded from `CLAUDE.md`) tells agents to use `npx @expo/agent-cli` instead of Expo CLI. It's generated: run the setup again instead of editing the managed block.
- Package skills are linked into `.claude/skills` from `node_modules` and are not committed.
- The Expo docs for the project's SDK are downloaded to `~/.expo/agent-cli/docs`, outside the repo.

Once after `yarn install`, and again after changing dependencies or the SDK:

```bash
npx @expo/agent-cli@latest agents:setup --agent claude-code --no-plugins   # links skills, updates AGENTS.md, syncs docs
npx @expo/agent-cli skills:sync                                           # only refresh the package skills
```

Useful commands: `status` (does a change need a native rebuild?), `doctor`, `typecheck`, `smoke --ios` (starts the app and checks it boots), `runtime:errors`, `runtime:tree`.

## Project Structure

```
App.tsx              # Entry point
navigation/          # React Navigation stack definitions
features/            # Feature modules (farms, crops, harvests, etc.)
components/          # Shared UI components
hooks/               # Shared hooks
api/                 # API client and generated types
auth/                # Auth logic (Supabase, Google, Apple)
supabase/            # Supabase client setup
theme/               # Theme and design tokens
locales/             # i18n translation files
utils/               # Shared utilities
constants/           # App-wide constants
storage/             # Local storage helpers
assets/              # Images, icons, fonts
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the [Commons Clause + AGPL-3.0](LICENSE). See the LICENSE file for details.
