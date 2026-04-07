#!/bin/bash

echo "🚀 Starting RemindMe App..."

# Step 1 - Get current IP
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
echo "📡 Your IP is: $IP"

# Step 2 - Update api.js with current IP
sed -i '' "s|const BASE_URL = '.*'|const BASE_URL = 'http://$IP:3000'|" /Users/pratham0310/Desktop/React-Native/Reminder-App/src/api/api.js
echo "✅ Updated api.js with IP: $IP"

# Step 3 - Start backend in new terminal
osascript -e 'tell application "Terminal" to do script "cd /Users/pratham0310/Desktop/React-Native/Reminder-App/backend && npm start"'

# Step 4 - Wait for emulator then run adb reverse
sleep 3
adb reverse tcp:3000 tcp:3000
echo "✅ adb reverse done"

echo "✅ Now run: npx expo start --clear"