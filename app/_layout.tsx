import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { I18nManager } from "react-native";
import "react-native-reanimated";

import { CurrenciesProvider } from "@/src/context/CurrenciesContext";
import { DeductionsProvider } from "@/src/context/DeductionsContext";
import { DocumentsProvider } from "@/src/context/DocumentsContext";
import { SettingsProvider } from "@/src/context/SettingsContext";

if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

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
  return (
    <SettingsProvider>
      <CurrenciesProvider>
        <DeductionsProvider>
          <DocumentsProvider>
            <ThemeProvider value={AppDarkTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="document-details"
                  options={{ title: "تفاصيل المستندات" }}
                />
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
                  name="modal"
                  options={{ presentation: "modal", title: "Modal" }}
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
