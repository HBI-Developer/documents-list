# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v2.0.0] - 2026-09-16

### 🚀 Major Platform & Infrastructure Upgrades
- **Expo SDK 57 Upgrade**: Upgraded core framework from Expo SDK 54 (`~54.0.35`) to Expo SDK 57 (`~57.0.23`).
- **React & React Native Core**:
  - React updated to `19.2.3` (from `19.1.0`).
  - React Native updated to `0.86.3` (from `0.81.5`).
  - React Native Reanimated updated to `4.5.1`.
  - React Native Screens updated to `~4.26.2`.
  - React Native Gesture Handler updated to `~2.32.0`.
  - TypeScript toolchain updated to `~6.0.3`.
- **Icon Library Migration**: Updated icon integration to `@react-native-vector-icons/ionicons` (`^13.1.4`).

### ✨ New Features & Enhancements
- **Database Backup & Restoration (`/database`)**:
  - Introduced full export and import capabilities for application data (documents, currencies, settings, deductions, and view mode) as versioned JSON backups.
  - Implemented strict schema validation (`DB_BACKUP_VERSION = 1`) with localized user feedback for invalid or corrupted backup files.
- **Dual Document View Modes**:
  - Added seamless switching between Grid View (`DocumentCard`) and List View (`DocumentListItem`) layouts across document screens.
- **Advanced Document Controls**:
  - **Adjust Total Dialog**: Added `AdjustTotalDialog` component allowing direct custom total overrides.
  - **Deduction Capacity Guard & Disabling**: Integrated `DisableAmountDialog` and `DeductionCapacityGuard` for managing document disabling and deduction capacity thresholds.
- **Customizable PDF Export**:
  - Added flexible column selection (serial number, document name, date, pages, amount) with clean HTML table formatting.

### 🛡️ Code Quality, Safety & Testing
- **Biome Integration**: Replaced ESLint with Biome (`@biomejs/biome` `^2.5.13`) for high-performance linting and formatting. Added `npm run lint`, `npm run lint:fix`, `npm run format`, and `npm run check`.
- **Unit Testing Framework**: Integrated Vitest (`^3.2.7`) with V8 coverage tools (`@vitest/coverage-v8`). Added unit test coverage for calculation logic (`src/utils/calculations.test.ts`) and database backups (`src/utils/databaseBackup.test.ts`).
- **Mutation Testing**: Integrated Stryker Mutator (`@stryker-mutator/core` `10.0.0`) to measure and enforce test suite quality.
- **Dependency & Code Auditing**: Integrated Knip (`knip` `^6.35.1`) for unused dependency and export detection, alongside Snyk vulnerability monitoring.
- **SonarQube Static Analysis**: Configured `sonar-project.properties` and `sonar-report.sh` script for automated static analysis and code quality reports.

### 🧹 Maintenance & Refactoring
- Removed legacy Expo starter boilerplate components (`hello-wave`, `parallax-scroll-view`, `themed-text`, `themed-view`, `collapsible`, etc.) and default template tabs.
- Streamlined context providers (`DocumentsContext`, `CurrenciesContext`, `DeductionsContext`, `SettingsContext`).
- Standardized calculation functions in `src/utils/calculations.ts` to guarantee decimal precision and edge-case safety.
