<p align="center">
  <img src="./assets/images/favicon.png" alt="App Icon" width="240" />
</p>

# Documents List

A React Native (Expo) application for managing a list of documents with metadata, local storage, and RTL (Arabic) support. The project provides a fast and simple UI to add, edit, and delete documents, with financial summaries and multi-currency support.

**Features**:

- List, card and grid views for documents.
- Document editor (title, date, amount, currency, notes).
- Local persistence using `AsyncStorage` (no backend required).
- RTL layout support for Arabic.
- Light and dark themes with customizable colors.
- Summary totals and currency-based filtering.
- Export documents to PDF.

**Requirements**:

- Node.js 16+ (18+ recommended).
- pnpm (recommended) or npm/yarn.
- Expo CLI or an Expo-compatible environment (Expo Go, Android/iOS simulator).

**Tech stack**:

- React Native + Expo
- Expo Router (file-based routing)
- TypeScript
- AsyncStorage
- Metro bundler
- pnpm (or npm/yarn)

**Running the project (using pnpm)**:

```bash
pnpm install
pnpm run start
# to clear Metro cache:
pnpm run start:clear
```

Or using npm:

```bash
npm install
npm run start
```

**Notes**:

- Avoid running `pnpm dlx expo start` — it can cause Metro to read files outside the project and produce the "Failed to get the SHA-1" (untracked file) error.
- The project uses a custom entry (`index.js`) to avoid the `EXPO_ROUTER_APP_ROOT` error on Android; if you still see it, restart Metro after clearing the cache.

**Project icon**:
The file `favicon.png` in the project root is shown above. Replace it with a square 1024×1024 PNG for better quality when used as an app icon.

**License**:
This project is licensed under the Apache License 2.0 — see [LICENSE](LICENSE) for details.

**Contributing**:

- Contributions are welcome: open an Issue or submit a Pull Request.
- Follow the formatting and lint rules in `package.json` and `eslint.config.js` when submitting changes.

**Resources & learning**:

- Expo docs: https://docs.expo.dev/
- Expo Router: https://docs.expo.dev/router/introduction/

If you'd like, I can add a short English summary file or adjust the icon path to a different location.
