# Development Hosting Guide

This guide explains how to test your development build on different devices and share it with others.

## Local Network Testing (Same WiFi)

1. Update `vite.config.ts` to allow external access:

```typescript
export default defineConfig({
  // ... other config
  server: {
    host: true, // Listen on all local IPs
    port: 5174, // Development port
    strictPort: true, // Don't try other ports if 5174 is taken
  },
});
```

2. Get your local IP address:

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

3. Start the development server:

```bash
npm run dev
```

4. Access on other devices:
   - Connect device to the same WiFi network
   - Open browser and go to: `http://YOUR_IP:5174`
   - Example: `http://192.168.8.3:5174`

## Public Access Using ngrok

### Initial Setup (M1/M2 Macs)

1. Install ngrok (choose one method):

   **Using Homebrew:**

   ```bash
   arch -arm64 brew install ngrok
   ```

   **Manual Installation:**

   - Visit https://ngrok.com/download
   - Download "Mac (ARM64)" version
   - Unzip the downloaded file:
     ```bash
     cd ~/Downloads
     unzip ngrok-v3-stable-darwin-arm64.zip
     sudo mv ngrok /usr/local/bin/
     ```

2. Create ngrok account:

   - Sign up at https://dashboard.ngrok.com/signup
   - Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken

3. Configure authtoken:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

### Starting Development Server with ngrok

1. Start your development server:

   ```bash
   npm run dev
   ```

2. In a new terminal, start ngrok:

   ```bash
   ngrok http http://localhost:5174
   ```

3. You'll see output like this:

   ```
   Session Status                online
   Account                       Your Account
   Version                       3.x.x
   Region                       United States (us)
   Forwarding                    https://xxxx-xx-xx-xxx-xx.ngrok.io -> http://localhost:5174
   ```

4. Use the provided `https://xxxx-xx-xx-xxx-xx.ngrok.io` URL to access your app from any device

### Important Notes

1. **URL Changes:**

   - ngrok free tier generates a new URL each time you restart
   - Keep the terminal with ngrok running to maintain the same URL
   - Share the new URL with testers when restarting ngrok

2. **Security:**

   - Anyone with the ngrok URL can access your development server
   - Don't expose sensitive data or development features
   - Consider using ngrok's authentication features for private testing

3. **Performance:**

   - Free tier has bandwidth limitations
   - Expect some latency compared to local testing
   - Best for testing and demonstration, not production use

4. **Troubleshooting:**
   - If ngrok shows "bad CPU type" error, ensure you're using ARM64 version
   - If port 5174 is busy, check if another dev server is running
   - Use `lsof -i :5174` to check what's using the port
   - Kill process if needed: `kill -9 PID`

### Best Practices

1. **Mobile Testing:**

   - Test touch interactions
   - Verify responsive layouts
   - Check loading performance
   - Test offline functionality

2. **Browser Tools:**

   - iOS Safari: Enable Web Inspector in Settings > Safari > Advanced
   - Android Chrome: Use chrome://inspect on desktop
   - Desktop Chrome: Use Device Toolbar (Cmd + Shift + M)

3. **Testing Checklist:**
   - Swipe gestures
   - Touch targets (buttons, links)
   - Form inputs and keyboard
   - Media playback
   - Network conditions
   - Loading states

### Common Commands Reference

```bash
# Start development server
npm run dev

# Start ngrok tunnel
ngrok http http://localhost:5174

# Check what's using port 5174
lsof -i :5174

# Kill process on port 5174
kill -9 $(lsof -t -i:5174)

# Get local IP
ifconfig | grep "inet " | grep -v 127.0.0.1
```
