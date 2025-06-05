### Project Overview  
A calorie-tracking mobile app that simplifies food logging using AI-powered image recognition (Google Gemini API). Users onboard with health goals, subscribe via paywall, and track meals by taking photos—automatically extracting nutrition data. Built with Expo, Supabase, and Clerk for auth.  

### Tech Stack  
- **Framework**: Expo (React Native)  
- **Language**: TypeScript  
- **Navigation**: Expo Router  
- **UI Library**: React Native Paper  
- **Backend/Auth**: Supabase (data), Clerk (auth)  
- **Deployment**: Expo Go (dev), EAS (prod)  

---  

### Expo Setup  
- Initialize Expo project with TypeScript template.  
- Configure `app.json` for Android-specific settings (permissions, icons).  
- Set up Supabase and Clerk SDKs with environment variables.  

### Authentication Flow  
1. **Onboarding Screens**: Collect health goals/habits via React Native Paper forms.  
2. **Paywall Gate**: Redirect to subscription screen (Clerk-integrated) before app access.  
3. **Session Management**: Clerk handles sign-up/login; Supabase stores user profiles.  

### Feature List  

#### 1. **AI-Powered Meal Logging**  
- Capture meal photos via device camera or gallery.  
- Integrate Google Gemini API to:  
  - Detect food items and portion sizes from images.  
  - Generate calorie/macronutrient breakdown via LLM chat.  
- Manual entry fallback for adjustments.  

#### 2. **Daily Tracking Dashboard**  
- Display total/remaining calories, macros (carbs, protein, fat).  
- List logged meals with collapsible nutrition details.  
- Real-time updates via Supabase subscriptions.  

#### 3. **Meal History & Analytics**  
- View past meals (grouped by day) in scrollable list.  
- Weekly/monthly summaries (calories, trends).  
- Offline support for cached data.  

#### 4. **User Profile & Goals**  
- Edit health metrics (weight, activity level).  
- Adjust calorie targets (maintenance/loss/gain).  
- Sync preferences to Supabase.  

#### 5. **Paywall & Subscriptions**  
- Clerk-managed subscription tiers (e.g., monthly/annual).  
- Restrict app access until payment confirmed.  

---  

### Mobile Considerations  
- **Camera/Gestures**: Expo’s `ImagePicker` for photo capture; swipe to delete meals.  
- **Offline**: Supabase local-first strategy for meal logging.  
- **Performance**: Optimize Gemini API calls with debouncing and image compression.  

(Word count: 498)