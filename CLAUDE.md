# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Coltivio is an open-source farm management React Native app built with Expo SDK 54. It manages plots (fields), crops, harvests, fertilizer/crop-protection applications, animals, and more. The default language is German (de); en, it, fr are also supported.

## Commands

```bash
yarn start              # Expo dev server
yarn ios / yarn android # Run on simulator/device
yarn typecheck          # tsc --noEmit (also checks scripts/)
yarn lint               # expo lint
yarn test               # jest --watchAll
yarn generate:api-types # regenerate api/v1.d.ts from openapi.json
```

EAS builds: `yarn eas:build-sim`, `yarn eas:build-dev-ios`, `yarn eas:build-preview-ios`, `yarn eas:build-production`.

## Architecture

### Navigation

`navigation/RootStack.tsx` is the single-stack root. It reads auth state from `SessionProvider` and renders one of: auth stack, error stack, onboarding stack (no farm yet), or the full app stack group. All feature route types are merged into `RootStackParamList` in `navigation/rootStackTypes.d.ts`.

Screen props: use `StackScreenProps<'ScreenName'>` from `navigation/rootStackTypes.d.ts`.

### Auth & Session

`auth/SessionProvider.tsx` wraps the app with a context that exposes `token`, `authUser`, `loadingFromStorage`, and session mutators. Auth is backed by Supabase (`supabase/supabase.ts`). `useSession()` is the hook to access it.

### API Layer

`api/api.ts` composes all domain APIs via `useApi()`. Each call site uses `const api = useApi()` to get an authenticated `openapi-fetch` client. Types are auto-generated from `openapi.json` → `api/v1.d.ts` (never hand-edit `v1.d.ts`).

Each domain API lives in `api/<name>.api.ts` and exports a factory function that takes a `FetchClient`.

### Feature Structure

Every feature follows this pattern:

```
features/<name>/
  <Name>Screen.tsx          # Screen component(s)
  <name>.hooks.ts           # TanStack Query hooks (useXxxQuery, useXxxMutation)
  <name>.querykeys.ts       # Query key factories (@lukemorales/query-key-factory)
  navigation/
    <Name>Stack.tsx         # renderXxxStack() function returning Stack.Screen elements
    <name>-routes.d.ts      # TypeScript route param types (XxxStackParamList)
```

### State Management

- **Server state**: TanStack Query (`@tanstack/react-query`) — all API data lives here.
- **Ephemeral/local state**: Zustand (`zustand`) — for multi-step flows (e.g. `features/plots/add-plots.store.ts`).

### Styling

`styled-components/native` with `ColtivioTheme` (`theme/theme.ts`). Access via `useTheme()`. Theme has `colors`, `spacing` (xxs/xs/s/m/l/xl/xxl), `radii`, and `map` tokens.

### Forms

`react-hook-form` with custom RH-prefixed wrapper components: `RHTextInput`, `RHNumberInput`, `RHDatePicker`, `RHSelect`, `RHSwitch`, etc. in `components/inputs/`.

### i18n

i18next initialized in `locales/i18n.ts`. Translation keys live in `locales/{en,de,it,fr}.json`. Default language is `de`. Use `useTranslation()` hook; never hardcode user-visible strings.

### Map

`@maplibre/maplibre-react-native` for rendering. `@turf/turf` for all geospatial calculations. Map components are in `components/map/`. The plots map feature (`features/plots/map/`) has a reducer-based mode system (`plots-map-mode.ts`) managing create/adjust/split/merge/view modes.

### Path Alias

`@/` maps to the repo root. Use it for all non-relative imports.
