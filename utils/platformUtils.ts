import { Platform, Dimensions } from 'react-native';

// Platform detection utilities
export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
export const isWeb = Platform.OS === 'web';
export const isMobile = isAndroid || isIOS;

// Screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Platform-specific styling utilities
export const platformStyles = {
  // Ensure mobile-first styling
  container: {
    flex: 1,
    ...(isWeb && {
      maxWidth: 400,
      alignSelf: 'center',
      width: '100%',
    }),
  },
  
  // Safe area handling
  safeArea: {
    flex: 1,
    ...(isAndroid && {
      paddingTop: 0, // Android handles this automatically
    }),
    ...(isIOS && {
      paddingTop: 0, // SafeAreaView handles this
    }),
  },
  
  // Touch targets (minimum 44px for mobile)
  touchTarget: {
    minHeight: isMobile ? 44 : 40,
    minWidth: isMobile ? 44 : 40,
  },
  
  // Typography scaling
  typography: {
    small: isMobile ? 12 : 14,
    body: isMobile ? 16 : 18,
    title: isMobile ? 20 : 24,
    heading: isMobile ? 24 : 28,
    large: isMobile ? 28 : 32,
  },
  
  // Spacing
  spacing: {
    xs: isMobile ? 4 : 6,
    sm: isMobile ? 8 : 12,
    md: isMobile ? 16 : 20,
    lg: isMobile ? 24 : 32,
    xl: isMobile ? 32 : 40,
  },
  
  // Border radius
  borderRadius: {
    sm: isMobile ? 8 : 6,
    md: isMobile ? 12 : 8,
    lg: isMobile ? 16 : 12,
    xl: isMobile ? 20 : 16,
  },
  
  // Shadows (mobile-optimized)
  shadow: {
    small: isMobile ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    } : {
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    
    medium: isMobile ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    } : {
      boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    },
    
    large: isMobile ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    } : {
      boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
    },
  },
};

// Responsive utilities
export const responsive = {
  width: screenWidth,
  height: screenHeight,
  isSmallScreen: screenWidth < 375,
  isMediumScreen: screenWidth >= 375 && screenWidth < 414,
  isLargeScreen: screenWidth >= 414,
  
  // Responsive values
  value: (small: number, medium?: number, large?: number) => {
    if (screenWidth < 375) return small;
    if (screenWidth < 414) return medium || small;
    return large || medium || small;
  },
  
  // Responsive font size
  fontSize: (baseSize: number) => {
    const scale = Math.min(screenWidth / 375, 1.2);
    return Math.round(baseSize * scale);
  },
  
  // Responsive spacing
  spacing: (baseSpacing: number) => {
    const scale = Math.min(screenWidth / 375, 1.1);
    return Math.round(baseSpacing * scale);
  },
};

// Force mobile behavior utilities
export const forceMobile = {
  // Disable web-specific behaviors
  disableWebBehaviors: () => {
    if (isWeb) {
      // Disable text selection
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      
      // Disable context menu
      document.addEventListener('contextmenu', (e) => e.preventDefault());
      
      // Disable zoom
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
      }
    }
  },
  
  // Force mobile viewport
  setMobileViewport: () => {
    if (isWeb) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  },
};

// Debug utilities
export const debugPlatform = () => {
  console.log('🔍 Platform Debug Info:', {
    platform: Platform.OS,
    version: Platform.Version,
    isAndroid,
    isIOS,
    isWeb,
    isMobile,
    screenWidth,
    screenHeight,
    userAgent: isWeb ? navigator.userAgent : 'N/A',
  });
};
