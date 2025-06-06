# CalorAi - AI-Powered Calorie Tracking App

A modern React Native mobile app built with Expo that simplifies food logging using AI-powered image recognition. Users can track their nutrition by simply taking photos of their meals.

## 🚀 Features

- **AI-Powered Meal Recognition**: Take photos of meals for automatic calorie and nutrition analysis
- **Comprehensive Onboarding**: Personalized setup based on health goals and activity level
- **User Authentication**: Secure sign-up/sign-in with Clerk
- **Daily Tracking Dashboard**: Monitor calories, macros, and nutrition progress
- **Modern UI**: Clean, intuitive interface inspired by leading health apps
- **Cross-Platform**: Works on iOS, Android, and Web

## 🛠 Tech Stack

- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **UI Library**: React Native Paper + Custom Components
- **Authentication**: Clerk
- **Backend**: Supabase (planned)
- **AI Integration**: Google Gemini API (planned)
- **State Management**: React Context + Hooks

## 📱 App Structure

### Onboarding Flow
1. **Welcome Screen**: App introduction and value proposition
2. **Goals Selection**: Choose health and nutrition goals
3. **Activity Level**: Select daily activity level
4. **Personal Info**: Enter age, gender, height, weight
5. **Target Weight**: Set weight goals and timeline
6. **Summary**: Review personalized plan

### Main App
- **Home**: Daily calorie tracking and progress overview
- **Camera**: AI meal scanning (coming soon)
- **History**: Meal history and analytics (coming soon)
- **Profile**: User settings and preferences (coming soon)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CalorAi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Fill in your API keys:
   - `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
   - `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `EXPO_PUBLIC_GEMINI_API_KEY`: Your Google Gemini API key

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device
# CalorAi-App
# CalorAi-App
