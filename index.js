/**
 * نقطة دخول مخصصة — تجنب خطأ EXPO_ROUTER_APP_ROOT مع Metro/pnpm.
 * إذا استمر الخطأ: أوقف Metro ثم شغّل: npx expo start --clear
 * ثم على أندرويد: npx expo run:android (إعادة بناء إن لزم).
 */
import "@expo/metro-runtime";
import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";
import "react-native-get-random-values";

function App() {
  const ctx = require.context("./app");
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
