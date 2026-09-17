import "react-native-get-random-values";
import { Stack } from "expo-router";
import { DarkTheme, ThemeProvider } from "expo-router/react-navigation";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { I18nManager } from "react-native";
import "react-native-reanimated";

import { DeductionCapacityGuard } from "@/src/components/DeductionCapacityGuard";
import { CurrenciesProvider } from "@/src/context/CurrenciesContext";
import { DeductionsProvider } from "@/src/context/DeductionsContext";
import { DocumentsProvider } from "@/src/context/DocumentsContext";
import { SettingsProvider } from "@/src/context/SettingsContext";

try {
  if (!I18nManager.isRTL) {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
  }
} catch {
  // RTL forcing is best-effort (e.g. web) — screens already lay out RTL explicitly.
}

void SplashScreen.preventAutoHideAsync().catch(() => {});

const AppDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#6366f1",
    background: "#0f0f1a",
    card: "#1a1a2e",
    text: "#e2e8f0",
    border: "#334155",
  },
};

export default function RootLayout() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync("#0f0f1a").catch(() => {});
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <SettingsProvider>
      <CurrenciesProvider>
        <DeductionsProvider>
          <DocumentsProvider>
            <DeductionCapacityGuard />
            <ThemeProvider value={AppDarkTheme}>
              <Stack
                screenOptions={{
                  contentStyle: { backgroundColor: "#0f0f1a" },
                  headerStyle: { backgroundColor: "#1a1a2e" },
                  headerTintColor: "#e2e8f0",
                  headerTitleStyle: { color: "#e2e8f0" },
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="document-details" options={{ title: "تفاصيل المستندات" }} />
                <Stack.Screen
                  name="document-editor"
                  options={{ presentation: "modal", title: "محرر المستند" }}
                />
                <Stack.Screen
                  name="currency-settings"
                  options={{ presentation: "modal", title: "إعدادات العملات" }}
                />
                <Stack.Screen
                  name="deductions"
                  options={{ presentation: "modal", title: "الخصومات" }}
                />
                <Stack.Screen
                  name="export-pdf"
                  options={{ presentation: "modal", title: "تصدير PDF" }}
                />
                <Stack.Screen
                  name="database"
                  options={{ presentation: "modal", title: "قاعدة البيانات" }}
                />
              </Stack>
              <StatusBar style="light" />
            </ThemeProvider>
          </DocumentsProvider>
        </DeductionsProvider>
      </CurrenciesProvider>
    </SettingsProvider>
  );
}
