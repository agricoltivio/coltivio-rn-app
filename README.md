# Coltivio

Coltivio is an open-source farm management app built with React Native and Expo. It helps farmers plan crop rotations, track harvests, manage parcels, and more.

## Tech Stack

- **React Native** (Expo SDK 54, New Architecture)
- **TypeScript** (strict mode)
- **React Navigation** for routing
- **Supabase** for auth and backend
- **TanStack Query** for data fetching
- **Zustand** for local state
- **styled-components** for styling
- **i18next** for internationalization
- **react-native-maps** + Turf.js for geospatial features

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

- Node.js 18+
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
