<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/images/favicon.png">
    <source media="(prefers-color-scheme: light)" srcset="./assets/images/favicon.png">
    <img src="./assets/images/favicon.png" alt="Documents List Logo" width="120" />
  </picture>
</p>

<h1 align="center">قائمة المستندات — Documents List</h1>

<p align="center">
  <strong>مدير مستندات مالية يعمل بدون اتصال، مع دعم العملات المتعددة وتتبع الخصومات وتصدير PDF والنسخ الاحتياطي — مصمم لسير العمل العربي (RTL).</strong>
</p>

<p align="center">
  <em>Offline-first financial document manager with multi-currency support, deduction tracking, JSON database backup, and PDF export — built for Arabic (RTL) workflows.</em>
</p>

<br />

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-Apache_2.0-blue?style=for-the-badge&logo=apache&logoColor=white&labelColor=0f0f1a&color=3b82f6" alt="License" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Platform-Android_|_iOS_|_Web-brightgreen?style=for-the-badge&logo=expo&logoColor=white&labelColor=0f0f1a&color=34d399" alt="Platform" /></a>
  <a href="#"><img src="https://img.shields.io/badge/RTL-Arabic_First-orange?style=for-the-badge&logo=googletranslate&logoColor=white&labelColor=0f0f1a&color=f97316" alt="RTL" /></a>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/React_Native-0.86-61DAFB?style=flat-square&logo=react&logoColor=white&labelColor=1a1a2e" alt="React Native" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Expo_SDK-57-000020?style=flat-square&logo=expo&logoColor=white&labelColor=1a1a2e" alt="Expo" /></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white&labelColor=1a1a2e" alt="TypeScript" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Vitest-Unit_Tests-6E9F18?style=flat-square&logo=vitest&logoColor=white&labelColor=1a1a2e" alt="Vitest" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Biome-Linter-60A5FA?style=flat-square&logo=biome&logoColor=white&labelColor=1a1a2e" alt="Biome" /></a>
</p>

<br />

## 📑 Table of Contents

- [✨ Why Documents List](#-why-documents-list)
- [🚀 Key Features](#-key-features)
- [🖼️ Screenshots](#️-screenshots)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [📁 Project Structure](#-project-structure)
- [⚡ Quick Start](#-quick-start)
- [⚙️ Configuration](#️-configuration)
- [📦 Building & Deployment](#-building--deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Why Documents List

<table>
<tr>
<td width="33%" align="center">

### 🔒 Offline-First & Secure

All data persists locally via **AsyncStorage**.<br />
No backend, no forced sign-up, full local JSON database backup & restore.

</td>
<td width="33%" align="center">

### 🌐 Arabic RTL First

Full right-to-left layout, Arabic labels,<br />
and `ar-EG` date formatting out of the box.

</td>
<td width="33%" align="center">

### 💰 Complete Financial Control

Multi-currency conversion, deduction tracking,<br />
custom total overrides, and styled PDF export.

</td>
</tr>
</table>

> **Built for Arabic-speaking freelancers and small businesses** who need a simple, fast, and reliable way to manage financial documents — entirely offline, with professional PDF output and strict data integrity.

---

## 🚀 Key Features

<table>
<thead>
<tr>
<th width="20%">Category</th>
<th width="25%">Feature</th>
<th>Description</th>
</tr>
</thead>
<tbody>

<tr><td colspan="3"><strong>📋 Data Management</strong></td></tr>
<tr><td></td><td>Dual Views</td><td>Switch between Grid view (<code>DocumentCard</code>) and List view (<code>DocumentListItem</code>)</td></tr>
<tr><td></td><td>Document Editor</td><td>Title, date, amount, notes, and calculation mode (multiply / fixed)</td></tr>
<tr><td></td><td>Database Backup</td><td>Full export and import of application database as versioned JSON backups (<code>DB_BACKUP_VERSION = 1</code>)</td></tr>
<tr><td></td><td>Batch Operations</td><td>Multi-select to delete or toggle documents in bulk</td></tr>
<tr><td></td><td>Smart Ordering</td><td>Insert documents at any position; auto-reindex on every mutation</td></tr>

<tr><td colspan="3"><strong>💳 Financial Tools</strong></td></tr>
<tr><td></td><td>Multi-Currency</td><td>Configurable primary currency + unlimited additional currencies with conversion rates</td></tr>
<tr><td></td><td>Deductions Tracking</td><td>Add, edit, and delete deduction amounts subtracted from gross totals</td></tr>
<tr><td></td><td>Advanced Dialogs</td><td>Adjust total overrides (<code>AdjustTotalDialog</code>), disable document amounts (<code>DisableAmountDialog</code>), and deduction capacity limits</td></tr>
<tr><td></td><td>Calculation Modes</td><td>Per-document: <code>multiply</code> (value × pages) or <code>fixed</code> (flat amount)</td></tr>
<tr><td></td><td>Summary Dashboard</td><td>Real-time totals for pages, amounts, deductions, and net</td></tr>

<tr><td colspan="3"><strong>📤 Export & Backup</strong></td></tr>
<tr><td></td><td>PDF Export</td><td>Generate a styled HTML-to-PDF table with custom column selection (serial, date, pages, amount). Uses SAF on Android and share sheet on iOS.</td></tr>
<tr><td></td><td>JSON Data Backup</td><td>Safely export and restore all data with localized validation error reporting.</td></tr>

<tr><td colspan="3"><strong>🎨 User Experience & Quality</strong></td></tr>
<tr><td></td><td>Dark Theme</td><td>Deep indigo dark theme (<code>#0f0f1a</code>) with customizable accent colors</td></tr>
<tr><td></td><td>RTL Layout</td><td>Mirrored navigation, right-aligned text, Arabic numerals</td></tr>
<tr><td></td><td>Unit & Mutation Testing</td><td>56 unit tests powered by Vitest and mutation testing via Stryker Mutator</td></tr>
<tr><td></td><td>Biome & SonarQube</td><td>Ultra-fast Biome linting/formatting and SonarQube static code analysis</td></tr>

</tbody>
</table>

---

## 🖼️ Screenshots

|                  Home Screen                  |                  Documents Details                  |
| :-------------------------------------------: | :-------------------------------------------------: |
| ![Home Screen](./assets/screenshots/home.jpg) | ![Documents Details](./assets/screenshots/grid.jpg) |
|         _Home Screen for Application_         | _Screen displaying and sorting the recorded files_  |

|                        Document Editor                        |                           Export PDF                           |
| :-----------------------------------------------------------: | :------------------------------------------------------------: |
|      ![Document Editor](./assets/screenshots/editor.jpg)      |         ![Export PDF](./assets/screenshots/export.jpg)         |
| _Document editor screen for adding or editing a new document_ | _Screen for exporting documents to a PDF file in table format_ |

---

## 🛠️ Tech Stack

<table>
<thead>
<tr>
<th width="25%">Category</th>
<th>Technology</th>
</tr>
</thead>
<tbody>
<tr><td><strong>Framework</strong></td><td><img src="https://img.shields.io/badge/React_Native-0.86-61DAFB?style=flat-square&logo=react&logoColor=white" /> <img src="https://img.shields.io/badge/Expo_SDK-57-000020?style=flat-square&logo=expo&logoColor=white" /> <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=white" /></td></tr>
<tr><td><strong>Language</strong></td><td><img src="https://img.shields.io/badge/TypeScript-6.0_(strict)-3178C6?style=flat-square&logo=typescript&logoColor=white" /></td></tr>
<tr><td><strong>Routing</strong></td><td>Expo Router v57 (file-based)</td></tr>
<tr><td><strong>Navigation</strong></td><td>React Navigation (native-stack + bottom-tabs)</td></tr>
<tr><td><strong>Storage & Backup</strong></td><td><code>@react-native-async-storage/async-storage</code> + Custom JSON Schema Backup Validation</td></tr>
<tr><td><strong>PDF & Sharing</strong></td><td><code>expo-print</code> · <code>expo-sharing</code> · <code>expo-file-system</code></td></tr>
<tr><td><strong>Animations & Gestures</strong></td><td><code>react-native-reanimated</code> 4.5 · <code>react-native-gesture-handler</code></td></tr>
<tr><td><strong>Date Picker</strong></td><td><code>@react-native-community/datetimepicker</code></td></tr>
<tr><td><strong>Icons</strong></td><td><code>@react-native-vector-icons/ionicons</code></td></tr>
<tr><td><strong>Linting / Formatting</strong></td><td>Biome 2 (<code>biome check</code>)</td></tr>
<tr><td><strong>Unit Testing</strong></td><td>Vitest 3 (<code>vitest run</code>) + V8 Coverage</td></tr>
<tr><td><strong>Mutation Testing</strong></td><td>Stryker Mutator 10 (<code>stryker run</code>)</td></tr>
<tr><td><strong>Static Analysis</strong></td><td>SonarQube (<code>sonar-project.properties</code>) + Knip + Snyk</td></tr>
<tr><td><strong>Bundler</strong></td><td>Metro (custom config)</td></tr>
<tr><td><strong>Package Manager</strong></td><td><img src="https://img.shields.io/badge/pnpm-latest-F69220?style=flat-square&logo=pnpm&logoColor=white" /></td></tr>
</tbody>
</table>

---

## 🏗️ Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                     App Entry (index.js)                      │
├───────────────────────────────────────────────────────────────┤
│                      app/_layout.tsx                          │
│   ┌────────────┬──────────────┬──────────────┬───────────┐    │
│   │  Settings  │  Currencies  │  Deductions  │ Documents │    │
│   │  Provider  │  Provider    │  Provider    │ Provider  │    │
│   └────────────┴──────────────┴──────────────┴───────────┘    │
│                       Providers                               │
├───────────────────────────────────────────────────────────────┤
│   ┌──────────────────────────────────────────────────────┐    │
│   │                   Tab Navigator                      │    │
│   │   ┌──────────┐                                       │    │
│   │   │   Home   │                                       │    │
│   │   └──────────┘                                       │    │
│   └──────────────────────────────────────────────────────┘    │
│                    Screens / Modals                           │
│   ┌────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│   │ Document   │  │ Currency │  │Deductions│  │ Export   │    │
│   │ Editor     │  │ Settings │  │          │  │  PDF     │    │
│   └────────────┘  └──────────┘  └──────────┘  └──────────┘    │
│   ┌────────────┐                                              │
│   │ Database   │                                              │
│   │ Backup/    │                                              │
│   │ Restore    │                                              │
│   └────────────┘                                              │
└───────────────────────────────────────────────────────────────┘
          ↓                   ↓                    ↓
┌───────────────────────────────────────────────────────────────┐
│               AsyncStorage (persistence layer)                │
│    Documents   │   Currencies   │   Settings   │  Deductions  │
└───────────────────────────────────────────────────────────────┘
```

> **Data flow:** Four context providers are loaded in dependency order — `SettingsProvider` → `CurrenciesProvider` → `DeductionsProvider` → `DocumentsProvider` — all inside a `ThemeProvider` that enforces the dark color scheme. Data flows unidirectionally: screens read from context, mutations pass through the provider to AsyncStorage, and re-renders propagate automatically.

---

## 📁 Project Structure

```
documents-list/
├── 📂 app/                          # Expo Router routes
│   ├── _layout.tsx                  # Root layout — providers, stack, theme
│   ├── 📂 (tabs)/                   # Tab navigator
│   │   ├── _layout.tsx
│   │   └── index.tsx                # Home screen
│   ├── currency-settings.tsx        # Currency management modal
│   ├── database.tsx                 # Database export & restore screen
│   ├── deductions.tsx               # Deduction management modal
│   ├── document-details.tsx         # Document grid / list screen
│   ├── document-editor.tsx          # Add / edit document modal
│   └── export-pdf.tsx               # PDF export configuration modal
│
├── 📂 src/
│   ├── 📂 components/               # Reusable UI components
│   │   ├── SummarySection.tsx       # Financial summary dashboard
│   │   ├── DocumentGrid.tsx         # Grid view container
│   │   ├── DocumentCard.tsx         # Grid document card item
│   │   ├── DocumentListItem.tsx     # List document row item
│   │   ├── AdjustTotalDialog.tsx    # Total adjustment modal
│   │   ├── DisableAmountDialog.tsx   # Document disable modal
│   │   ├── DeductionCapacityGuard.tsx # Deduction capacity guard
│   │   └── FAB.tsx                  # Floating action button
│   ├── 📂 context/                  # React Context providers
│   │   ├── DocumentsContext.tsx
│   │   ├── CurrenciesContext.tsx
│   │   ├── DeductionsContext.tsx
│   │   └── SettingsContext.tsx
│   ├── 📂 screens/
│   │   └── HomeScreen.tsx           # Main home screen
│   ├── 📂 storage/
│   │   └── store.ts                 # AsyncStorage wrapper (CRUD)
│   ├── 📂 theme/
│   │   ├── colors.ts                # Dark theme palette
│   │   └── spacing.ts               # Spacing scale tokens
│   └── 📂 utils/
│       ├── calculations.ts          # Calculation engine (math & currencies)
│       ├── calculations.test.ts     # Vitest suite for calculations
│       ├── databaseBackup.ts        # Backup export, import & validation
│       ├── databaseBackup.test.ts   # Vitest suite for database backups
│       ├── toggleLabel.ts           # UI toggle label helper
│       └── date.ts                  # ISO ↔ ar-EG date formatting
│
├── 📂 assets/images/                # Icons, splash, favicon
├── CHANGELOG.md                     # Release version history
├── index.js                         # Custom entry point
├── app.config.js                    # Expo dynamic config (v2.0.0)
├── eas.json                         # EAS Build profiles
├── biome.json                       # Biome linter & formatter config
├── vitest.config.ts                 # Vitest test framework config
├── stryker.conf.json                # Stryker mutation testing config
├── knip.json                        # Knip unused exports config
├── sonar-project.properties         # SonarQube static analysis config
├── sonar-report.sh                  # SonarQube report generator script
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies & scripts
└── LICENSE                          # Apache 2.0
```

---

## ⚡ Quick Start

### Prerequisites

| Requirement            | Version                     |
| ---------------------- | --------------------------- |
| **Node.js**            | `18+`                       |
| **pnpm** (recommended) | Latest                      |
| **Expo Go**            | Latest (for mobile testing) |

### Installation

```bash
# Clone the repository
git clone https://github.com/HBI-Developer/documents-list.git
cd documents-list

# Install dependencies
pnpm install
```

### Running the App

```bash
# Start with cache cleared (recommended for first run)
pnpm run start:clear

# Or standard start
pnpm start
```

> Scan the QR code with **Expo Go**, or press `a` for Android / `i` for iOS simulator.

### Available Scripts

| Command                | Description                                       |
| ---------------------- | ------------------------------------------------- |
| `pnpm start`           | Start Expo dev server                             |
| `pnpm start:clear`     | Start with cleared Metro cache                    |
| `pnpm run android`     | Run on Android emulator                           |
| `pnpm run ios`         | Run on iOS simulator                              |
| `pnpm run web`         | Run in browser (React Native Web)                 |
| `pnpm run lint`        | Run Biome check (linting + formatting)            |
| `pnpm run lint:fix`    | Auto-fix lint & formatting issues with Biome      |
| `pnpm run format`      | Format codebase with Biome                        |
| `pnpm run typecheck`   | Run TypeScript typecheck (`tsc --noEmit`)         |
| `pnpm test`            | Run unit tests with Vitest                        |
| `pnpm test:mutation`   | Run mutation tests with Stryker                   |
| `pnpm knip:check`      | Find unused exports & dependencies (Knip)         |
| `pnpm snyk:test`       | Scan for security vulnerabilities (Snyk)          |
| `pnpm run check`       | Comprehensive check (Biome + Typecheck + Knip)   |

---

## ⚙️ Configuration

<details>
<summary><strong>💱 Primary Currency</strong></summary>

Set the primary currency name (e.g., `"دينار"`, `"﷼"`, `"$"`) in the settings screen.
This label is used throughout the UI as the default unit.

</details>

<details>
<summary><strong>🌍 Multi-Currency</strong></summary>

Add additional currencies with:

| Field         | Description                                                               |
| ------------- | ------------------------------------------------------------------------- |
| **Name**      | Display label                                                             |
| **Rate**      | Conversion multiplier from primary currency                               |
| **Operation** | `multiply` (for less-valued units) or `divide` (for greater-valued units) |

</details>

<details>
<summary><strong>➖ Deductions</strong></summary>

Create named deduction amounts that are subtracted from the gross document total.
Deductions update the summary dashboard in real time.

</details>

<details>
<summary><strong>💾 Database Backup & Restore</strong></summary>

Navigate to the Database screen (`app/database.tsx`) to export or restore a complete JSON backup of all application data. Backups strictly validate document formats, currency rates, deductions, and settings before applying.

</details>

---

## 📦 Building & Deployment

This project uses [**EAS Build**](https://docs.expo.dev/build/introduction/) for production builds.

### Build Profiles

| Profile       | Type | Output | Use Case                        |
| ------------- | ---- | ------ | ------------------------------- |
| `development` | APK  | `.apk` | Debug / internal testing        |
| `preview`     | APK  | `.apk` | Staging / internal distribution |
| `production`  | AAB  | `.aab` | Google Play Store               |

### Build Commands

```bash
# 🔧 Development APK
eas build --platform android --profile development

# 📦 Production AAB (Google Play)
eas build --platform android --profile production

# 🍎 iOS (requires Apple Developer account)
eas build --platform ios --profile production
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository and create a feature branch
2. **Code** following the existing conventions and Biome rules
3. **Test** by running `pnpm run check` and `pnpm test`
4. **Submit** a Pull Request with a clear description

> [!NOTE]
> Please ensure your code follows the existing RTL-first design patterns and Arabic language conventions used throughout the project.

---

## 📄 License

This project is licensed under the **Apache License 2.0** — see the [`LICENSE`](LICENSE) file for details.

```
Copyright 2024 HBI-Developer

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0
```

---

<p align="center">
  <sub>Made with ❤️ by <a href="https://github.com/HBI-Developer">Hussam Al-Bashir</a></sub>
</p>
