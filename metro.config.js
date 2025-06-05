const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure proper platform resolution
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

// Platform-specific extensions
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'android.js',
  'android.ts',
  'android.tsx',
  'ios.js',
  'ios.ts',
  'ios.tsx',
  'native.js',
  'native.ts',
  'native.tsx',
];

// Ensure proper asset resolution
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
];

// Android-specific optimizations
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    mangle: {
      keep_fnames: true,
    },
    output: {
      ascii_only: true,
      quote_keys: true,
      wrap_iife: true,
    },
    sourceMap: {
      includeSources: false,
    },
    toplevel: false,
    warnings: false,
  },
};

module.exports = config;
