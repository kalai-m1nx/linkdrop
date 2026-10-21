# LinkDrop — Multi-Platform File & Video Sharing (Flutter) 🚀

LinkDrop is a cross-platform application for sharing large files and videos (up to 1TB) with a single link. Built with **Flutter**, a single codebase compiles natively for **Android**, **iOS**, **Windows desktop**, and the **Web**.

---

## 📱 Platform Feature Matrix

| Feature | Web (Chrome/Edge/Safari) | Android | Windows Desktop | iOS |
| :--- | :--- | :--- | :--- | :--- |
| **Pick Photos & Videos** | File picker (all formats) | Native Photo & Media picker | File dialog | Photo Library & Document picker |
| **Drag & Drop** | In-browser dropzone | N/A (Mobile UX) | Native Desktop drop | N/A (Mobile UX) |
| **Resumable Upload** | TUS chunked upload | TUS chunked upload | TUS chunked upload | TUS chunked upload |
| **Share Actions** | Copy link, WhatsApp, QR code | Native Share Sheet (`share_plus`), WhatsApp | Copy link, QR code | Native Share Sheet (`share_plus`), WhatsApp |
| **Public Download Page** | Direct route `/s/:id` without login | In-app view & browser link | In-app view & browser link | In-app view & browser link |
| **Streaming Video** | HTML5 streaming player | Native video player | Native video player | Native video player |
| **Forced Downloads** | Signed attachment URLs | Direct file save | Direct file save | Direct file save |

---

## 🛠️ How to Run & Build Each Target

### 1. Web (Chrome & Browsers)
```bash
# Run locally in Chrome:
flutter run -d chrome

# Build production web bundle:
flutter build web --release
```
*Output directory:* `build/web/`

---

### 2. Android
```bash
# Run on connected Android device/emulator:
flutter run -d android

# Build Debug APK:
flutter build apk --debug

# Build Release APK:
flutter build apk --release

# Build Google Play App Bundle:
flutter build appbundle --release
```
*Output directory:* `build/app/outputs/flutter-apk/app-release.apk`

---

### 3. Windows Desktop
```bash
# Run locally on Windows:
flutter run -d windows

# Build Windows Release executable (.exe):
flutter build windows --release
```
*Output directory:* `build/windows/x64/runner/Release/`

---

### 4. iOS
```bash
# Run on connected iPhone or Simulator (macOS host required):
flutter run -d ios

# Build iOS archive:
flutter build ios --release
```

---

## ⚙️ Platform-Specific Setup & Permissions

### 🤖 Android Setup (`android/app/src/main/AndroidManifest.xml`)
The following permissions and intent filters are configured:
```xml
<!-- Network -->
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>

<!-- Storage & Media -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="29"/>
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES"/>
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO"/>
<uses-permission android:name="android.permission.READ_MEDIA_AUDIO"/>

<!-- Deep link support for opening /s/:slug links directly in LinkDrop -->
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" android:pathPrefix="/s" />
</intent-filter>
```

### 🍎 iOS Setup (`ios/Runner/Info.plist`)
Permissions for camera, photo library, document sharing, and URL schemes are declared:
```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>LinkDrop needs access to your photo library to select photos and videos to share.</string>
<key>NSCameraUsageDescription</key>
<string>LinkDrop needs access to your camera to capture media to share.</string>
<key>NSMicrophoneUsageDescription</key>
<string>LinkDrop needs microphone access when recording videos to share.</string>
<key>UIFileSharingEnabled</key>
<true/>
<key>LSSupportsOpeningDocumentsInPlace</key>
<true/>
<key>LSApplicationQueriesSchemes</key>
<array>
    <string>whatsapp</string>
    <string>https</string>
    <string>http</string>
</array>
```

### 🪟 Windows Desktop Build Requirements
To compile the native Windows desktop `.exe`:
1. Open the **Visual Studio Installer**.
2. Under Visual Studio Community, click **Modify**.
3. Select the workload **"Desktop development with C++"** and make sure the following are checked:
   - MSVC C++ x64/x86 build tools
   - C++ CMake tools for Windows
   - Windows 10/11 SDK
4. Once installed, run:
   ```bash
   flutter build windows --release
   ```

---

## 🌐 Deploying the Web Version (Vercel / Firebase / Netlify)

### Deploying to Vercel
1. Run the web build:
   ```bash
   flutter build web --release
   ```
2. LinkDrop includes `vercel.json` with SPA URL rewrites so `/s/:slug` routes resolve directly to `index.html`.
3. Set the Root/Output directory in Vercel to `build/web`.
4. Deploy! Anyone opening `https://your-domain.vercel.app/s/abc123` in Chrome can view photos, stream videos, and download files without installing anything.

---

## 🗄️ Supabase Backend & Database Setup

1. In your Supabase project, go to **SQL Editor** -> **New Query**.
2. Run [`supabase/schema.sql`](./supabase/schema.sql) to create:
   - `drops` table (`id`, `slug`, `title`, `total_size`, `file_count`, `expires_at`)
   - `drop_files` table (`id`, `drop_id`, `file_name`, `file_size`, `storage_path`)
   - Storage bucket `linkdrop-files` (private, signed URLs)
   - Row Level Security (RLS) policies.
3. Enable `pg_cron` in Supabase (**Database** -> **Extensions** -> `pg_cron`), and run [`supabase/cleanup_cron.sql`](./supabase/cleanup_cron.sql) to enable automatic hourly purging of expired drops and storage files.

> **Zero-Config Demo Mode**: LinkDrop automatically operates in local demo mode when Supabase credentials are empty, allowing you to test the complete drag-and-drop, chunked upload, QR code, video streaming, and download experience immediately on any platform!
