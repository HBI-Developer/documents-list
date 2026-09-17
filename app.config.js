/**
 * إعداد التطبيق — تغيير اسم التطبيق والأيقونة من هنا.
 * اسم التطبيق: عدّل APP_DISPLAY_NAME.
 * الأيقونة: استبدل ملف assets/images/icon.png بصورة 1024×1024 (وadaptive على أندرويد إن رغبت).
 */
const APP_DISPLAY_NAME = "قائمة المستندات";

export default {
  expo: {
    name: APP_DISPLAY_NAME,
    slug: "documents-list",
    version: "2.0.0",
    orientation: "portrait",
    scheme: "documentslist",
    userInterfaceStyle: "automatic",
    backgroundColor: "#0f0f1a",
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.howar.documentslist",
      icon: "./assets/images/ios-icon-default.png",
    },
    extra: {
      eas: {
        projectId: "4b28ce8a-4c1e-4722-bf9d-13ee7e7565d6",
      },
    },
    android: {
      backgroundColor: "#0f0f1a",
      adaptiveIcon: {
        backgroundColor: "#1a1a2e",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      package: "com.howar.documentslist",
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
      backgroundColor: "#0f0f1a",
    },
    plugins: [
      "expo-router",
      "@react-native-community/datetimepicker",
      "expo-font",
      "expo-image",
      "expo-sharing",
      "expo-web-browser",
      "expo-status-bar",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/favicon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#0f0f1a",
          dark: { backgroundColor: "#0f0f1a" },
        },
      ],
    ],
    experiments: { typedRoutes: true, reactCompiler: true },
  },
};
