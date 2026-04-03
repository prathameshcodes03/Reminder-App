**RemindMe App — Complete Setup Guide (Windows)**

---

**Step 1 — Install Required Software**

Install all of these one by one:

**Node.js**
Go to https://nodejs.org → Download LTS version → Install with default settings.
```bash
node --version
npm --version
```
Both should print a version number.

**Git**
Go to https://git-scm.com/download/win → Download → Install with default settings.
```bash
git --version
```

**Android Studio**
Go to https://developer.android.com/studio → Download → Install.
During installation make sure these are checked:
- Android SDK
- Android SDK Platform
- Android Virtual Device

**MySQL**
Go to https://dev.mysql.com/downloads/installer → Download MySQL Installer → Run it → Choose **Developer Default** → Install everything → Set a root password (remember this password).

---

**Step 2 — Set Android Environment Variables**

Search **Environment Variables** in Windows Start Menu → Click **Edit the system environment variables** → Click **Environment Variables** button.

Under **System Variables** click **New**:
```
Variable name:  ANDROID_HOME
Variable value: C:\Users\YourName\AppData\Local\Android\Sdk
```
Replace `YourName` with your actual Windows username.

Then find **Path** in System Variables → Click **Edit** → Click **New** and add these two:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
```
Click OK on all windows.

Verify by opening a new terminal:
```bash
adb --version
```

---

**Step 3 — Install Expo CLI**

Open Command Prompt or PowerShell and run:
```bash
npm install -g expo-cli
```

---

**Step 4 — Create Android Emulator**

Open Android Studio → More Actions → Virtual Device Manager → Create Device → Select **Pixel 9 Pro** → Next → Download **API 34** system image (click Download next to it, wait for it) → Next → Finish.

---

**Step 5 — Clone the Project**

Open Command Prompt in the folder where you want the project:
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```
Replace with your actual GitHub link.

---

**Step 6 — Setup Database**

Open **MySQL Workbench** → Connect to Local Instance → Click the folder icon to open SQL file → Navigate to project folder → open `backend/database.sql` → Click the **lightning bolt** button to run it.

You should see `remindme_db` appear in the left panel under Schemas.

---

**Step 7 — Configure MySQL Password**

Open `backend/db.js` in any text editor (Notepad, VS Code):
```js
password: 'your_mysql_password',  // ← put your MySQL root password here
```

---

**Step 8 — Install Dependencies**

Open Command Prompt in the project folder:

```bash
npm install
npx expo install @react-native-async-storage/async-storage expo-av
```

```bash
cd backend
npm install
cd ..
```

---

**Step 9 — Run the App (Every Time)**

Follow this exact order every time:

**First — Start the emulator:**
Open Android Studio → Virtual Device Manager → Press the ▶ Play button on Pixel 9 Pro. Wait until the emulator is fully booted and shows the Android home screen.

**Second — Open terminal 1 and start Expo:**
```bash
npx expo start --clear
```
Press `a` → wait for the app to load on the emulator.

**Third — Open terminal 2 and start backend:**
```bash
cd backend
npm start
```

You should see:
```
3000
🚀 RemindMe backend running on http://0.0.0.0:3000
✅ MySQL connected successfully
```

**Now open the app and register → login → use it!**

---

**Troubleshooting**

**Network Error on login:**
You started the backend before the emulator. Always start emulator and Expo first, then backend.

**MySQL error in backend:**
Your password in `backend/db.js` is wrong. Double check it matches what you set during MySQL installation.

**`adb` not found:**
Environment variables not set correctly. Redo Step 2 and open a fresh terminal.

**Metro bundler slow or stuck:**
```bash
npx expo start --clear
```

**Port 3000 already in use:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```
Replace `<PID_NUMBER>` with the number shown.

**Emulator not opening:**
Open Android Studio → SDK Manager → SDK Tools → check **Android SDK Command Line Tools** → Apply.

---

**Important Rules**
- Always start emulator first, Expo second, backend third
- Never close the backend terminal while using the app
- Both terminals must stay open at the same time
- MySQL must be running before starting the backend

---

**Tech Stack**
React Native 0.74 · Expo 51 · Node.js · Express · MySQL 8 · JWT · expo-av
