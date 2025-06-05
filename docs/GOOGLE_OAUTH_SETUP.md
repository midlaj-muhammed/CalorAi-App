# Google OAuth Setup Guide for CalorAi

This guide will help you set up Google OAuth authentication in your CalorAi app using Clerk.

## Prerequisites

- A Google Cloud Platform account
- A Clerk account with your CalorAi project set up
- Access to your app's development and production environments

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)

### 1.2 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Select **Application type**: **Web application**
4. Add **Authorized redirect URIs**:
   - For development: `https://your-clerk-frontend-api.clerk.accounts.dev/v1/oauth_callback`
   - For production: `https://your-production-domain.clerk.accounts.dev/v1/oauth_callback`

### 1.3 Note Your Credentials
- Copy the **Client ID** and **Client Secret**
- You'll need these for Clerk configuration

## Step 2: Configure Clerk Dashboard

### 2.1 Access Clerk Dashboard
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your CalorAi project

### 2.2 Enable Google OAuth
1. Navigate to **User & Authentication** > **Social Connections**
2. Find **Google** in the list of providers
3. Click **Configure** or the toggle to enable it

### 2.3 Add Google Credentials
1. Enter your **Google Client ID**
2. Enter your **Google Client Secret**
3. Configure the scopes (recommended: `email`, `profile`)
4. Save the configuration

## Step 3: Update App Configuration

### 3.1 Environment Variables
Ensure your `.env` file has the correct Clerk publishable key:
```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

### 3.2 App.json Configuration
The app.json should already be configured with the correct scheme:
```json
{
  "expo": {
    "scheme": "calorai",
    "extra": {
      "clerkPublishableKey": "your_clerk_publishable_key_here"
    }
  }
}
```

## Step 4: Test the Integration

### 4.1 Development Testing
1. Start your development server: `npm start`
2. Open the app on a device or simulator
3. Navigate to the sign-in or sign-up screen
4. Tap "Continue with Google"
5. Complete the OAuth flow

### 4.2 Production Testing
1. Build and deploy your app
2. Test the Google OAuth flow in the production environment
3. Verify that users can sign in and their data is properly stored

## Step 5: Configure Redirect URLs for Different Environments

### Development Environment
- Expo Go: `exp://localhost:8081/--/oauth-native-callback`
- Development Build: `calorai://oauth-native-callback`

### Production Environment
- Production App: `calorai://oauth-native-callback`

## Troubleshooting

### Common Issues

1. **"OAuth Error" or "Invalid Client"**
   - Verify your Google Client ID and Secret in Clerk
   - Check that redirect URLs match exactly
   - Ensure Google+ API is enabled

2. **"Redirect URI Mismatch"**
   - Add all necessary redirect URIs in Google Cloud Console
   - Include both development and production URLs

3. **"App Not Verified" Warning**
   - This is normal for development
   - For production, you may need to verify your app with Google

4. **Clerk Development Keys Warning**
   - This warning appears in development
   - Use production keys for your live app

### Debug Steps

1. Check Clerk Dashboard logs for OAuth errors
2. Verify Google Cloud Console OAuth settings
3. Test with different devices/browsers
4. Check network connectivity and firewall settings

## Security Best Practices

1. **Never expose Client Secret**: Keep it secure in Clerk dashboard only
2. **Use HTTPS**: Always use HTTPS in production
3. **Validate Tokens**: Clerk handles token validation automatically
4. **Monitor Usage**: Keep track of OAuth usage in both Google and Clerk dashboards

## Additional Resources

- [Clerk OAuth Documentation](https://clerk.com/docs/authentication/social-connections/google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Expo OAuth Guide](https://docs.expo.dev/guides/authentication/)

## Support

If you encounter issues:
1. Check the Clerk Dashboard for error logs
2. Review Google Cloud Console OAuth settings
3. Consult the Clerk community or documentation
4. Contact Clerk support for complex issues
