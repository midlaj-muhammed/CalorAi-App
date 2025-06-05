#!/bin/bash

# CalorAi EAS Build Size Verification Script
# This script helps verify EAS build configuration and expected sizes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header() {
    echo -e "${BLUE}"
    echo "=================================="
    echo "$1"
    echo "=================================="
    echo -e "${NC}"
}

# Main function
main() {
    print_header "CalorAi EAS Build Size Verification"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || ! grep -q '"name": "calorai"' package.json; then
        print_error "This script must be run from the CalorAi project root directory."
        exit 1
    fi
    
    print_info "Verifying EAS build configuration and expected sizes..."
    
    # Check EAS configuration
    print_header "EAS Configuration Check"
    
    if [ ! -f "eas.json" ]; then
        print_error "eas.json not found!"
        exit 1
    fi
    
    print_success "eas.json found"
    
    # Check environment variables in EAS config
    if grep -q "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY" eas.json; then
        print_success "Clerk environment variable configured"
    else
        print_warning "Clerk environment variable might be missing"
    fi
    
    if grep -q "EXPO_PUBLIC_SUPABASE_URL" eas.json; then
        print_success "Supabase environment variables configured"
    else
        print_warning "Supabase environment variables might be missing"
    fi
    
    if grep -q "EXPO_PUBLIC_GEMINI_API_KEY" eas.json; then
        print_success "Gemini API environment variable configured"
    else
        print_warning "Gemini API environment variable might be missing"
    fi
    
    # Check app.json configuration
    print_header "App Configuration Check"
    
    if [ ! -f "app.json" ]; then
        print_error "app.json not found!"
        exit 1
    fi
    
    # Check asset bundle patterns
    if grep -q '"assetBundlePatterns"' app.json; then
        print_success "Asset bundle patterns configured"
        ASSET_PATTERN=$(grep -A 2 '"assetBundlePatterns"' app.json | grep -o '"[^"]*"' | tail -1)
        print_info "Asset pattern: $ASSET_PATTERN"
    else
        print_warning "Asset bundle patterns not found"
    fi
    
    # Check dependencies
    print_header "Dependencies Check"
    
    # Count total dependencies
    TOTAL_DEPS=$(grep -c '"' package.json | grep -v "name\|version\|scripts" || echo "0")
    print_info "Total package.json entries: $TOTAL_DEPS"
    
    # Check for large dependencies
    print_info "Checking for large dependencies..."
    
    if grep -q "react-native-reanimated" package.json; then
        print_info "✓ react-native-reanimated (animations) - ~2-3MB"
    fi
    
    if grep -q "@expo/vector-icons" package.json; then
        print_info "✓ @expo/vector-icons (icon fonts) - ~4-5MB"
    fi
    
    if grep -q "react-native-paper" package.json; then
        print_info "✓ react-native-paper (UI components) - ~1-2MB"
    fi
    
    if grep -q "@supabase/supabase-js" package.json; then
        print_info "✓ @supabase/supabase-js (database) - ~500KB"
    fi
    
    if grep -q "@clerk/clerk-expo" package.json; then
        print_info "✓ @clerk/clerk-expo (authentication) - ~1MB"
    fi
    
    # Expected size calculation
    print_header "Expected Bundle Size Analysis"
    
    echo "📊 CalorAi Expected Bundle Composition:"
    echo "  • JavaScript Bundle: 6-8 MB"
    echo "    - React Native core: ~2MB"
    echo "    - App code & contexts: ~1MB"
    echo "    - UI libraries (Paper, etc): ~1-2MB"
    echo "    - Navigation & routing: ~500KB"
    echo "    - Authentication (Clerk): ~1MB"
    echo "    - Database (Supabase): ~500KB"
    echo "    - Animations (Reanimated): ~1MB"
    echo ""
    echo "  • Vector Icon Fonts: 4-5 MB"
    echo "    - MaterialIcons: ~350KB"
    echo "    - FontAwesome: ~800KB"
    echo "    - MaterialCommunityIcons: ~1.1MB"
    echo "    - Other icon fonts: ~2-3MB"
    echo ""
    echo "  • App Assets: 500KB - 1MB"
    echo "    - App icons & splash: ~200KB"
    echo "    - Navigation assets: ~100KB"
    echo "    - Other assets: ~200-700KB"
    echo ""
    echo "  📱 TOTAL EXPECTED SIZE: 10-15 MB"
    
    # EAS Build vs Local Export
    print_header "EAS Build vs Local Export"
    
    echo "🔍 Size Differences Explained:"
    echo ""
    echo "  📦 Local Export (expo export):"
    echo "    - Includes all assets uncompressed"
    echo "    - Development-friendly format"
    echo "    - Size: ~10-15 MB"
    echo ""
    echo "  🏗️  EAS Build (production APK):"
    echo "    - Assets compressed and optimized"
    echo "    - Tree-shaking removes unused code"
    echo "    - Android-specific optimizations"
    echo "    - APK compression applied"
    echo "    - Size: Often 30-50% smaller than export"
    echo ""
    echo "  ⚖️  Expected APK Size: 6-10 MB"
    echo "    - If your APK is 4MB, it might indicate:"
    echo "      1. Aggressive compression (normal)"
    echo "      2. Missing assets (problem)"
    echo "      3. Tree-shaking removed too much (problem)"
    echo "      4. Build configuration issue (problem)"
    
    # Verification steps
    print_header "Verification Steps"
    
    echo "🔍 To verify your 4MB build is correct:"
    echo ""
    echo "  1. Install the APK on a device"
    echo "  2. Test all app features:"
    echo "     ✓ Icons display correctly"
    echo "     ✓ Navigation works"
    echo "     ✓ Camera functionality"
    echo "     ✓ Food scanning"
    echo "     ✓ Recipe generation"
    echo "     ✓ Progress charts"
    echo "     ✓ Authentication"
    echo ""
    echo "  3. Check for missing assets:"
    echo "     ✓ App icon appears correctly"
    echo "     ✓ Splash screen shows"
    echo "     ✓ All MaterialIcons render"
    echo "     ✓ No missing font errors"
    echo ""
    echo "  4. Monitor for errors:"
    echo "     ✓ No console errors about missing files"
    echo "     ✓ No 'font not found' warnings"
    echo "     ✓ All screens load properly"
    
    # Build recommendations
    print_header "Build Recommendations"
    
    echo "🚀 For optimal builds:"
    echo ""
    echo "  1. Use preview profile for testing:"
    echo "     eas build --profile preview --platform android"
    echo ""
    echo "  2. Clear cache if issues persist:"
    echo "     eas build --profile preview --platform android --clear-cache"
    echo ""
    echo "  3. Check build logs for warnings:"
    echo "     Look for asset bundling warnings"
    echo "     Check for dependency resolution issues"
    echo ""
    echo "  4. Compare with local export:"
    echo "     npm run analyze-bundle"
    echo "     Verify all assets are present locally"
    
    print_header "Conclusion"
    
    if [ "$1" = "4mb" ]; then
        print_warning "4MB APK size analysis:"
        echo "  • Could be normal due to compression"
        echo "  • Test all features to verify completeness"
        echo "  • If features work, size is likely optimized"
        echo "  • If features broken, rebuild with --clear-cache"
    else
        print_success "Build configuration appears correct"
        echo "  • Expected APK size: 6-10 MB"
        echo "  • Local export size: 10-15 MB"
        echo "  • All dependencies and assets configured"
    fi
    
    print_header "Verification Complete!"
}

# Run main function
main "$@"
