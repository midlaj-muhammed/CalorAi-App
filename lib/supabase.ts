import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database } from '../types/supabase';

// Get Supabase configuration from environment or fallback to app.json
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://rktkvalibcljmngkdtva.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrdGt2YWxpYmNsam1uZ2tkdHZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NzEwMjcsImV4cCI6MjA2NDQ0NzAyN30.ZjKp9x9MK1vUNDhdkwYvnbFueAExlhQrx1EWhysbEAg';

// Create Supabase client with AsyncStorage for session persistence
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper function to get current user ID
export const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

// Helper function to get user profile by Clerk ID
export const getUserProfileByClerkId = async (clerkUserId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
};

// Helper function to create or update user profile
export const upsertUserProfile = async (profileData: any) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(profileData, {
      onConflict: 'clerk_user_id',
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting user profile:', error);
    throw error;
  }

  return data;
};

// Helper function to format date for database
export const formatDateForDB = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Helper function to get today's date
export const getTodayDate = (): string => {
  return formatDateForDB(new Date());
};

// Helper function to check if user exists
export const checkUserExists = async (clerkUserId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single();

  return !error && !!data;
};

// Real-time subscription helper
export const subscribeToUserData = (
  userId: string,
  table: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel(`${table}_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};

// Batch operations helper
export const batchInsert = async (table: string, records: any[]) => {
  const { data, error } = await supabase
    .from(table)
    .insert(records)
    .select();

  if (error) {
    console.error(`Error batch inserting to ${table}:`, error);
    throw error;
  }

  return data;
};

// Error handling helper
export const handleSupabaseError = (error: any, operation: string) => {
  console.error(`Supabase ${operation} error:`, error);
  
  if (error.code === 'PGRST116') {
    throw new Error('No data found');
  } else if (error.code === '23505') {
    throw new Error('Duplicate entry');
  } else if (error.code === '23503') {
    throw new Error('Referenced record not found');
  } else {
    throw new Error(error.message || 'Database operation failed');
  }
};

// Connection status helper
export const checkConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('user_profiles').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
};

// Offline queue for when connection is lost
class OfflineQueue {
  private queue: Array<{
    operation: string;
    table: string;
    data: any;
    timestamp: number;
  }> = [];

  add(operation: string, table: string, data: any) {
    this.queue.push({
      operation,
      table,
      data,
      timestamp: Date.now(),
    });
    this.saveToStorage();
  }

  async process() {
    const isOnline = await checkConnection();
    if (!isOnline || this.queue.length === 0) return;

    const operations = [...this.queue];
    this.queue = [];

    for (const op of operations) {
      try {
        switch (op.operation) {
          case 'insert':
            await supabase.from(op.table).insert(op.data);
            break;
          case 'update':
            await supabase.from(op.table).update(op.data.updates).eq('id', op.data.id);
            break;
          case 'delete':
            await supabase.from(op.table).delete().eq('id', op.data.id);
            break;
        }
      } catch (error) {
        console.error('Error processing offline operation:', error);
        // Re-add failed operation to queue
        this.queue.push(op);
      }
    }

    this.saveToStorage();
  }

  private async saveToStorage() {
    try {
      await AsyncStorage.setItem('supabase_offline_queue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  async loadFromStorage() {
    try {
      const stored = await AsyncStorage.getItem('supabase_offline_queue');
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
    }
  }

  clear() {
    this.queue = [];
    this.saveToStorage();
  }
}

export const offlineQueue = new OfflineQueue();

// Initialize offline queue on app start
offlineQueue.loadFromStorage();

// Process offline queue periodically
setInterval(() => {
  offlineQueue.process();
}, 30000); // Every 30 seconds
