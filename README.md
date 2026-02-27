# Documents List

A React Native (Expo) app for managing a list of documents with metadata, local storage (AsyncStorage), RTL Arabic support, a dark theme, summary totals, and multiple currencies.

## App name & icon

- **Name:** Update `APP_DISPLAY_NAME` at the top of `app.config.js`.
- **Icon:** Replace `assets/images/icon.png` with a 1024×1024 PNG, or change `APP_ICON_PATH` in `app.config.js`.

## Running the project (pnpm recommended)

Run the project from the local repository (do not use `pnpm dlx`):

```bash
pnpm install
pnpm run start
# or to clear Metro cache:
pnpm run start:clear
```

Avoid using `pnpm dlx expo start` because that runs Expo from pnpm's global cache, which can cause Metro to read files outside the project and produce the "Failed to get the SHA-1" (untracked file) error.

If you prefer npm/yarn you can use the equivalent commands:

```bash
npm install
npm run start
```

## Troubleshooting: EXPO_ROUTER_APP_ROOT on Android

This project uses a custom entry (`index.js`) to avoid the `EXPO_ROUTER_APP_ROOT` error. If you still see the error:

1. Stop Metro (Ctrl+C).
2. Start with a cleared cache: `pnpm run start:clear` or `npx expo start --clear`.
3. If you're building a local binary (not using Expo Go), rebuild the app: `npx expo run:android`.

## Troubleshooting: "Failed to get the SHA-1" (untracked file)

Common causes and fixes:

1. File outside the project (untracked): Often caused by running Expo via `pnpm dlx`. Start Metro from the project using `pnpm run start` or `pnpm exec expo start` after `pnpm install`.
2. `blockList` in Metro config: Ensure `metro.config.js` does not exclude the project path or `node_modules`.
3. Deleted file or stale cache: Stop Metro, run `pnpm run start:clear`, then restart.

## Get started

1. Install dependencies

```bash
pnpm install
```

2. Start the app

```bash
pnpm run start
```

The Metro output provides options to open the app in:

- a development build
- an Android emulator
- an iOS simulator
- Expo Go (limited sandbox)

You can start developing by editing files in the `app` directory. This project uses file-based routing via Expo Router.

## Reset project

To create a fresh starter layout, run:

```bash
npm run reset-project
```

This moves the current starter code to `app-example` and creates a blank `app` directory for new development.

## Learn more

Helpful resources:

- Expo docs: https://docs.expo.dev/
- Expo Router: https://docs.expo.dev/router/introduction/

## Community

- Expo on GitHub: https://github.com/expo/expo
- Expo Discord: https://chat.expo.dev
