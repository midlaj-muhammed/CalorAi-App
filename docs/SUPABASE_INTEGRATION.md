# CalorAi Supabase Integration Guide

## Overview

This document outlines the comprehensive Supabase integration for the CalorAi mobile application, providing a robust, scalable database foundation with real-time capabilities, offline support, and seamless authentication integration.

## 🗄️ Database Schema

### Core Tables

1. **user_profiles** - User account and onboarding data
2. **nutrition_entries** - Food logging and meal tracking
3. **water_intake** - Water consumption tracking
4. **exercise_sessions** - Workout and exercise data
5. **exercise_details** - Detailed exercise information
6. **recipes** - User recipes and meal plans
7. **daily_progress** - Aggregated daily nutrition/fitness data
8. **fasting_sessions** - Intermittent fasting tracking
9. **user_preferences** - App settings and preferences

### Key Features

- **UUID Primary Keys** for all tables
- **Foreign Key Constraints** ensuring data integrity
- **Automatic Timestamps** with updated_at triggers
- **Check Constraints** for data validation
- **Optimized Indexes** for query performance
- **JSONB Support** for flexible data structures

## 🔐 Authentication & Security

### Row Level Security (RLS)

All tables have RLS policies ensuring users can only access their own data:

```sql
-- Example policy for nutrition_entries
CREATE POLICY "Users can view own nutrition entries" ON nutrition_entries
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );
```

### Clerk Integration

- **Seamless Authentication** with existing Clerk setup
- **JWT Token Validation** for secure API access
- **User ID Mapping** between Clerk and Supabase
- **Automatic Profile Creation** on first login

## 📱 Client Integration

### TypeScript Types

Comprehensive type definitions in `types/supabase.ts`:

```typescript
export interface UserProfile {
  id: string;
  clerk_user_id: string;
  email: string;
  // ... other fields
}

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: UserProfileInsert;
        Update: UserProfileUpdate;
      };
      // ... other tables
    };
  };
}
```

### Service Layer

Organized CRUD operations in `services/database.ts`:

- **UserProfileService** - Profile management
- **NutritionService** - Food logging operations
- **WaterService** - Water intake tracking
- **ExerciseService** - Workout management
- **RecipeService** - Recipe operations
- **ProgressService** - Analytics and progress
- **FastingService** - Intermittent fasting
- **PreferencesService** - User settings

### Real-time Context

`contexts/SupabaseContext.tsx` provides:

- **Real-time Subscriptions** for live data updates
- **Automatic Data Sync** across app components
- **Connection Status Monitoring**
- **Offline Queue Management**

## 🔄 Migration Strategy

### Automatic Migration

The `services/migration.ts` handles:

1. **Detection** of existing AsyncStorage data
2. **Mapping** legacy data to Supabase schema
3. **Batch Import** of historical data
4. **Cleanup** of legacy storage
5. **Error Handling** and rollback

### Migration Process

```typescript
// Check if migration is needed
const needsMigration = await MigrationService.needsMigration(clerkUserId);

if (needsMigration) {
  // Perform automatic migration
  await MigrationService.performMigration(clerkUserId, email);
  
  // Optional: Clean up legacy data
  await MigrationService.cleanupLegacyData();
}
```

## 🌐 Real-time Features

### Live Data Updates

- **Nutrition Entries** - Real-time meal logging
- **Water Intake** - Live hydration tracking
- **Daily Progress** - Instant macro calculations
- **Exercise Sessions** - Live workout updates

### Subscription Management

```typescript
// Subscribe to user's nutrition data
const subscription = subscribeToUserData(
  userId,
  'nutrition_entries',
  (payload) => {
    // Handle real-time updates
    console.log('Nutrition update:', payload);
  }
);
```

## 📴 Offline Support

### Offline Queue

Automatic queuing of operations when offline:

```typescript
// Operations are automatically queued when offline
await NutritionService.addEntry(entryData);

// Queue processes automatically when connection returns
offlineQueue.process();
```

### Data Persistence

- **AsyncStorage Backup** for critical data
- **Automatic Sync** when connection restored
- **Conflict Resolution** for concurrent updates
- **Graceful Degradation** during network issues

## 🚀 Performance Optimization

### Database Indexes

Optimized indexes for common queries:

```sql
CREATE INDEX idx_nutrition_entries_user_date ON nutrition_entries(user_id, date);
CREATE INDEX idx_water_intake_user_date ON water_intake(user_id, date);
CREATE INDEX idx_daily_progress_user_date ON daily_progress(user_id, date);
```

### Query Optimization

- **Selective Queries** with specific field selection
- **Pagination** for large datasets
- **Batch Operations** for multiple inserts
- **Connection Pooling** for efficient resource usage

### Caching Strategy

- **Context-level Caching** for frequently accessed data
- **Real-time Updates** invalidate cache automatically
- **Optimistic Updates** for better UX
- **Background Refresh** for stale data

## 🛠️ Setup Instructions

### 1. Database Setup

Run the SQL scripts in Supabase dashboard:

```bash
# Create tables and indexes
supabase/schema.sql

# Set up Row Level Security
supabase/rls-policies.sql
```

### 2. Environment Configuration

Update `.env` with Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Provider Setup

Wrap your app with SupabaseProvider:

```typescript
<ClerkProvider>
  <SupabaseProvider>
    <OnboardingProvider>
      {/* Your app components */}
    </OnboardingProvider>
  </SupabaseProvider>
</ClerkProvider>
```

## 📊 Usage Examples

### Adding Nutrition Entry

```typescript
import { useSupabase } from '../contexts/SupabaseContext';

const { addNutritionEntry } = useSupabase();

await addNutritionEntry({
  meal_type: 'breakfast',
  food_name: 'Oatmeal',
  calories: 150,
  protein_g: 5,
  carbs_g: 30,
  fat_g: 3,
});
```

### Real-time Water Tracking

```typescript
const { addWaterIntake, todayWater } = useSupabase();

// Add water intake
await addWaterIntake(250); // 250ml

// todayWater automatically updates via real-time subscription
console.log('Total water today:', todayWater.reduce((sum, intake) => sum + intake.amount_ml, 0));
```

### Progress Analytics

```typescript
import { ProgressService } from '../services/database';

// Get weight history
const weightHistory = await ProgressService.getWeightHistory(userId, 30);

// Get daily progress
const todayProgress = await ProgressService.getDailyProgress(userId, today);
```

## 🔍 Monitoring & Debugging

### Connection Status

```typescript
const { isConnected } = useSupabase();

if (!isConnected) {
  // Show offline indicator
  console.log('App is offline - data will sync when connection returns');
}
```

### Error Handling

```typescript
try {
  await NutritionService.addEntry(entryData);
} catch (error) {
  if (error.message === 'No data found') {
    // Handle specific error
  } else {
    // Handle general error
    console.error('Database error:', error);
  }
}
```

## 🎯 Benefits Achieved

### For Users
- **Seamless Experience** with automatic data sync
- **Offline Capability** for uninterrupted usage
- **Real-time Updates** across devices
- **Data Security** with proper access controls

### For Developers
- **Type Safety** with comprehensive TypeScript definitions
- **Scalable Architecture** with service layer pattern
- **Easy Maintenance** with organized code structure
- **Performance Optimized** with proper indexing and caching

### For Business
- **Reliable Data Storage** with PostgreSQL backend
- **Real-time Analytics** capabilities
- **Scalable Infrastructure** that grows with user base
- **Cost Effective** with Supabase's pricing model

## 🔮 Future Enhancements

- **Advanced Analytics** with custom aggregations
- **Data Export** functionality
- **Backup & Restore** capabilities
- **Multi-device Sync** optimization
- **Advanced Caching** with Redis integration
- **GraphQL API** for complex queries

This Supabase integration provides CalorAi with a robust, scalable, and feature-rich database foundation that maintains the app's Lifesum-inspired design aesthetic while delivering enterprise-grade performance and reliability.
