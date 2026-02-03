# قائمة المستندات

تطبيق React Native (Expo) لإدارة قائمة مستندات مع بيانات وصفية، تخزين محلي (AsyncStorage)، واجهة عربية RTL وثيم داكن، مع ملخص إجماليات وعملات متعددة.

## تغيير اسم التطبيق والأيقونة

- **الاسم:** عدّل `APP_DISPLAY_NAME` في أعلى ملف [`app.config.js`](app.config.js).
- **الأيقونة:** استبدل الملف `assets/images/icon.png` بصورة 1024×1024، أو غيّر `APP_ICON_PATH` في `app.config.js`.

## تشغيل المشروع (مهم مع pnpm)

شغّل التطبيق من **التثبيت المحلي** داخل المشروع، وليس عبر `pnpm dlx`:

```bash
pnpm install
pnpm run start
# أو مع مسح الكاش: pnpm run start:clear
```

لا تستخدم `pnpm dlx expo start` — لأن ذلك يشغّل Expo من كاش pnpm خارج المشروع، فيحاول Metro قراءة ملفات من هناك ويظهر خطأ "Failed to get the SHA-1" (الملف غير مُراقَب).

## إذا ظهر خطأ EXPO_ROUTER_APP_ROOT على أندرويد

المشروع يستخدم نقطة دخول مخصصة (`index.js`) لتجنب هذا الخطأ. إذا استمر:

1. أوقف خادم Metro (Ctrl+C).
2. شغّل مع مسح الكاش: `pnpm run start:clear` أو `npx expo start --clear`.
3. إن كنت تبني التطبيق محلياً (وليس Expo Go)، أعد البناء: `npx expo run:android`.

## إذا ظهر خطأ "Failed to get the SHA-1" (الملف غير مُراقَب)

الأسباب المحتملة والمعالجة:

1. **الملف خارج المشروع (غير مُراقَب)** — غالباً بسبب تشغيل Expo عبر `pnpm dlx`. الحل: استخدم `pnpm run start` أو `pnpm exec expo start` بعد `pnpm install` داخل مجلد المشروع.
2. **blockList** — تأكد أن `metro.config.js` لا يستبعد مسار المشروع أو `node_modules`.
3. **الملف حُذف أو الكاش قديم** — جرّب: أوقف Metro، ثم `pnpm run start:clear` ثم أعد فتح التطبيق.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
