#!/bin/bash

set -e

ROOT="/Users/pratham0310/Desktop/React-Native/Reminder-App"
BACKEND_DIR="$ROOT/backend"
EMULATOR_NAME="Pixel_9_Pro"

echo "🚀 Starting RemindMe App..."

if ! command -v adb >/dev/null 2>&1; then
  echo "❌ adb not found. Open Android Studio once and make sure platform-tools are installed."
  exit 1
fi

if ! command -v emulator >/dev/null 2>&1; then
  echo "❌ Android emulator command not found."
  exit 1
fi

DEVICE_COUNT=$(adb devices | awk 'NR>1 && $2=="device" {count++} END {print count+0}')

if [ "$DEVICE_COUNT" -eq 0 ]; then
  echo "📱 No emulator connected. Launching $EMULATOR_NAME..."
  nohup emulator @"$EMULATOR_NAME" -no-snapshot-load >/tmp/reminder-emulator.log 2>&1 &
fi

echo "⏳ Waiting for emulator..."
adb wait-for-device

BOOT_STATUS=""
until [ "$BOOT_STATUS" = "1" ]; do
  BOOT_STATUS=$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')
  sleep 2
done

echo "✅ Emulator connected"

echo "🔁 Setting up adb reverse..."
adb reverse tcp:3000 tcp:3000
adb reverse tcp:8081 tcp:8081
echo "✅ adb reverse ready for ports 3000 and 8081"

echo "🖥️ Starting backend in a new terminal..."
osascript -e "tell application \"Terminal\" to do script \"cd $BACKEND_DIR && npm start\""

echo "📦 Starting Expo in a new terminal..."
osascript -e "tell application \"Terminal\" to do script \"cd $ROOT && npx expo start -c --android\""

echo "✅ Startup commands launched"
