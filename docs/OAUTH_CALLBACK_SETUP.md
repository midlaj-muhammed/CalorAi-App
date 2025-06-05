# OAuth Authentication Issues Fix

This guide explains how to fix OAuth authentication issues including "Unmatched Route" and "You're already signed in" errors.

## Problems Identified

1. **Unmatched Route Error**: `exp://192.168.194.64:8084/--/oauth-native-callback` - OAuth callback URL not properly configured
2. **"You're already signed in" Error**: OAuth flow attempting to authenticate when user is already authenticated

## Solution

### 1. Update Clerk Dashboard Settings

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your CalorAi project
3. Navigate to **User & Authentication** > **Social Connections**
4. Click on **Google** to configure it
5. In the **Redirect URLs** section, add these URLs:

#### For Development:
```
exp://localhost:8081/oauth-native-callback
exp://192.168.194.64:8084/oauth-native-callback
```

#### For Production:
```
calorai://oauth-native-callback
```

### 2. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Select your OAuth 2.0 Client ID
4. In **Authorized redirect URIs**, add:

```
https://your-clerk-frontend-api.clerk.accounts.dev/v1/oauth_callback
```

Replace `your-clerk-frontend-api` with your actual Clerk frontend API URL (found in your Clerk dashboard).

### 3. App Configuration

The app has been updated with:

- **OAuth callback route**: `app/oauth-native-callback.tsx` handles the OAuth redirect
- **Updated routing**: The callback route is registered in `app/_layout.tsx`
- **Fixed GoogleOAuthButton**:
  - Added authentication state checking to prevent OAuth when already signed in
  - Removed manual navigation that was causing conflicts
  - Button now hides when user is already authenticated
- **Updated auth screens**: Added authentication state checking to redirect signed-in users

### 4. Testing the Fix

1. Start your development server:
   ```bash
   npm start
   ```

2. Open the app on your device or simulator

3. Try signing in with Google

4. The OAuth flow should now redirect properly to the dashboard without showing the "Unmatched Route" error

## Important Notes

- The IP address `192.168.194.64:8084` in the error is your development server's network address
- Make sure to add both localhost and network IP addresses to handle different development scenarios
- The `--` in the original URL was causing the routing issue - the new setup removes this
- Always test OAuth flows on both simulator and physical devices

## Troubleshooting

If you still see the error:

1. **Clear app cache**: Close and restart the Expo development server
2. **Check Clerk configuration**: Ensure all redirect URLs are saved in Clerk dashboard
3. **Verify Google Console**: Make sure the Clerk callback URL is added to Google OAuth settings
4. **Test on different devices**: Try both simulator and physical device

## File Changes Made

- `app/_layout.tsx`: Added oauth-native-callback route
- `app/oauth-native-callback.tsx`: New OAuth callback handler
- `components/GoogleOAuthButton.tsx`:
  - Added authentication state checking
  - Removed manual navigation
  - Button hides when user is already signed in
- `app/(auth)/sign-in.tsx`:
  - Added authentication state checking
  - Auto-redirects signed-in users
- `app/(auth)/sign-up.tsx`:
  - Added authentication state checking
  - Auto-redirects signed-in users

## Key Fixes

1. **Prevents "You're already signed in" error** by checking authentication state before OAuth
2. **Fixes routing issues** with proper OAuth callback handling
3. **Improves UX** by hiding OAuth button when user is authenticated
4. **Auto-redirects** authenticated users away from auth screens
