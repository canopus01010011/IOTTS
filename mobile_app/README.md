# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the **backend** (from repo `backend/`, port 5000):

   ```bash
   npm install
   npm run dev
   ```

3. Configure API URL (only if login still fails):

   ```bash
   cd mobile_app
   npm run env:api    # writes your PC LAN IP to .env
   npx expo start -c  # -c clears cache after .env changes
   ```

   Default `.env` uses `EXPO_PUBLIC_API_URL=auto` so Expo Go picks the same IP as Metro.
   Android emulator uses `10.0.2.2` automatically when Metro host is localhost.

4. Start the app (**Expo Go** on your phone)

   ```bash
   npx expo start --lan
   ```

   - Phone and PC must be on the **same Wi‑Fi**
   - In Expo Go, scan the QR code (use **LAN**, not **Tunnel** — tunnel cannot reach `localhost:5000` on your PC)
   - Login screen shows `API: http://192.168.x.x:5000/api` in dev — that IP must match your PC (`ipconfig`)

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

## Offline mode

The app caches data locally and queues QR scans when there is no network.

| Feature | Behavior |
|---------|----------|
| **Missions list** | Saved after each successful fetch; shown from cache when offline |
| **Mission details** | Cached per `MIS-…` after first online open |
| **GPS / Map** | Last live position and trail cached per container; polling pauses offline |
| **QR scans** | Stored in a queue; auto-sync when connection returns |
| **Session** | If `/auth/me` fails offline, last logged-in user profile is restored |

**UI:** Orange banner = offline; green banner = pending scans or sync status.

**Test:** Open app online once (missions load), enable airplane mode, browse missions and scan QR — reconnect to sync scans.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
