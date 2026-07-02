<p align="center">
  <img src="./assets/images/favicon.png" alt="Documents List" width="120" />
</p>

<h1 align="center">Documents List</h1>

<p align="center">
  A React Native (Expo) application for managing documents with metadata, local storage, and RTL (Arabic) support.
</p>

---

## Overview

Documents List provides a fast and simple UI to add, edit, and delete documents. It includes financial summaries, multi-currency support, and works entirely offline — no backend required.

## Features

| Feature | Description |
|---|---|
| Multiple views | List, card, and grid layouts |
| Document editor | Title, date, amount, currency, and notes |
| Local storage | Persistent data via `AsyncStorage` |
| RTL support | Full Arabic layout support |
| Theming | Light and dark modes with customizable colors |
| Summaries | Totals and currency-based filtering |
| PDF export | Export document list as a formatted PDF table |

## Tech Stack

- **Framework:** React Native + Expo
- **Routing:** Expo Router (file-based)
- **Language:** TypeScript
- **Storage:** AsyncStorage
- **Bundler:** Metro
- **Package manager:** pnpm (or npm / yarn)

## Requirements

- Node.js 16 or later (18+ recommended)
- pnpm (recommended), npm, or yarn
- Expo CLI or an Expo-compatible environment (Expo Go, Android/iOS simulator)

## Getting Started

**Using pnpm (recommended):**

```bash
pnpm install
pnpm run start
```

**Using npm:**

```bash
npm install
npm run start
```

**Clear Metro cache:**

```bash
pnpm run start:clear
```

## Notes

- Avoid running `pnpm dlx expo start` — it can cause Metro to read files outside the project and produce a `Failed to get the SHA-1` error for untracked files.
- The project uses a custom entry point (`index.js`) to prevent the `EXPO_ROUTER_APP_ROOT` error on Android. If the error persists, clear the cache and restart Metro.

## Contributing

Contributions are welcome. To get started:

1. Fork the repository and create a new branch.
2. Make your changes following the formatting and lint rules defined in `package.json` and `eslint.config.js`.
3. Open a Pull Request with a clear description of the change.

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)

## License

This project is licensed under the **Apache License 2.0** — see the [LICENSE](LICENSE) file for details.
