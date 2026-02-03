/**
 * إعداد التطبيق — تغيير اسم التطبيق والأيقونة من هنا.
 * اسم التطبيق: عدّل APP_DISPLAY_NAME.
 * الأيقونة: استبدل ملف assets/images/icon.png بصورة 1024×1024 (وadaptive على أندرويد إن رغبت).
 */
const APP_DISPLAY_NAME = 'قائمة المستندات';
const APP_ICON_PATH = './assets/images/icon.png';

export default {
  expo: {
    name: APP_DISPLAY_NAME,
    slug: 'documents-list',
    version: '1.0.0',
    orientation: 'portrait',
    icon: APP_ICON_PATH,
    scheme: 'documentslist',
    userInterfaceStyle: 'dark',
    newArchEnabled: true,
    ios: { supportsTablet: true },
    android: {
      adaptiveIcon: {
        backgroundColor: '#1a1a2e',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      package: "com.howar.documentslist",
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: { output: 'static', favicon: './assets/images/favicon.png' },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#0f0f1a',
          dark: { backgroundColor: '#0f0f1a' },
        },
      ],
    ],
    experiments: { typedRoutes: true, reactCompiler: true },
  },
};
