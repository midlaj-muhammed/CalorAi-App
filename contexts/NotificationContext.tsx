import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@clerk/clerk-expo';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'meal' | 'water' | 'exercise' | 'progress' | 'achievement';
  timestamp: Date;
  read: boolean;
  icon: string;
  actionData?: any; // Optional data for notification actions
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  loadNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const loadNotifications = async () => {
    try {
      if (user) {
        const stored = await AsyncStorage.getItem(`notifications_${user.id}`);
        if (stored) {
          const parsedNotifications = JSON.parse(stored).map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp)
          }));
          // Sort by timestamp, newest first
          parsedNotifications.sort((a: Notification, b: Notification) => 
            b.timestamp.getTime() - a.timestamp.getTime()
          );
          setNotifications(parsedNotifications);
        }
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const saveNotifications = async (newNotifications: Notification[]) => {
    try {
      if (user) {
        await AsyncStorage.setItem(`notifications_${user.id}`, JSON.stringify(newNotifications));
        setNotifications(newNotifications);
      }
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const addNotification = async (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    const updatedNotifications = [newNotification, ...notifications].slice(0, 50); // Keep only latest 50
    await saveNotifications(updatedNotifications);
  };

  const markAsRead = async (notificationId: string) => {
    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    await saveNotifications(updatedNotifications);
  };

  const markAllAsRead = async () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    await saveNotifications(updatedNotifications);
  };

  const deleteNotification = async (notificationId: string) => {
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    await saveNotifications(updatedNotifications);
  };

  const clearAllNotifications = async () => {
    await saveNotifications([]);
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    loadNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Notification helper functions
export const createMealReminder = (mealType: string): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
  title: 'Meal Reminder',
  message: `Don't forget to log your ${mealType}! Keep track of your nutrition goals.`,
  type: 'meal',
  icon: 'restaurant',
  actionData: { mealType }
});

export const createWaterReminder = (): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
  title: 'Stay Hydrated',
  message: 'Time for a water break! Remember to stay hydrated throughout the day.',
  type: 'water',
  icon: 'water-drop',
});

export const createExerciseReminder = (): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
  title: 'Exercise Time',
  message: 'Ready for a workout? Even a short walk can make a difference!',
  type: 'exercise',
  icon: 'fitness-center',
});

export const createProgressUpdate = (message: string): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
  title: 'Progress Update',
  message,
  type: 'progress',
  icon: 'trending-up',
});

export const createAchievement = (title: string, message: string): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
  title,
  message,
  type: 'achievement',
  icon: 'emoji-events',
});

// Notification scheduling helpers
export const scheduleNotifications = {
  mealReminders: {
    breakfast: { hour: 8, minute: 0 },
    lunch: { hour: 12, minute: 30 },
    dinner: { hour: 18, minute: 30 },
    snacks: { hour: 15, minute: 0 },
  },
  waterReminders: {
    interval: 2, // hours
    startHour: 8,
    endHour: 22,
  },
  exerciseReminders: {
    hour: 18,
    minute: 0,
  },
};

export default NotificationContext;
