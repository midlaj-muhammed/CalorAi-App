#!/bin/bash

# CalorAi Bundle Analysis Script
# This script analyzes the app bundle size and identifies potential issues

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
    print_header "CalorAi Bundle Size Analysis"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || ! grep -q '"name": "calorai"' package.json; then
        print_error "This script must be run from the CalorAi project root directory."
        exit 1
    fi
    
    print_info "Analyzing CalorAi bundle size and potential issues..."
    
    # Clean previous exports
    if [ -d "dist-analysis" ]; then
        rm -rf dist-analysis
        print_info "Cleaned previous analysis directory"
    fi
    
    # Export for Android
    print_header "Exporting Android Bundle"
    npx expo export --platform android --output-dir dist-analysis
    
    # Analyze bundle size
    print_header "Bundle Size Analysis"
    
    # Total export size
    TOTAL_SIZE=$(du -sh dist-analysis/ | cut -f1)
    print_info "Total export size: $TOTAL_SIZE"
    
    # JavaScript bundle size
    if [ -f "dist-analysis/_expo/static/js/android/"*.hbc ]; then
        JS_BUNDLE_SIZE=$(du -sh dist-analysis/_expo/static/js/android/*.hbc | cut -f1)
        print_info "JavaScript bundle size: $JS_BUNDLE_SIZE"
    else
        print_warning "JavaScript bundle not found"
    fi
    
    # Assets size
    if [ -d "dist-analysis/_expo/static/assets" ]; then
        ASSETS_SIZE=$(du -sh dist-analysis/_expo/static/assets/ | cut -f1)
        print_info "Assets size: $ASSETS_SIZE"
    else
        print_warning "Assets directory not found"
    fi
    
    # Count files
    TOTAL_FILES=$(find dist-analysis/ -type f | wc -l)
    print_info "Total files: $TOTAL_FILES"
    
    # Analyze large files
    print_header "Large Files Analysis"
    echo "Top 10 largest files:"
    find dist-analysis/ -type f -exec du -h {} + | sort -rh | head -10
    
    # Check for missing assets
    print_header "Asset Verification"
    
    # Check for vector icons
    if find dist-analysis/ -name "*MaterialIcons*" | grep -q .; then
        print_success "Material Icons found"
    else
        print_warning "Material Icons might be missing"
    fi
    
    if find dist-analysis/ -name "*FontAwesome*" | grep -q .; then
        print_success "FontAwesome icons found"
    else
        print_warning "FontAwesome icons might be missing"
    fi
    
    # Check for app assets
    if find dist-analysis/ -name "*adaptive-icon*" | grep -q .; then
        print_success "App adaptive icon found"
    else
        print_warning "App adaptive icon might be missing"
    fi
    
    if find dist-analysis/ -name "*splash*" | grep -q .; then
        print_success "Splash screen found"
    else
        print_warning "Splash screen might be missing"
    fi
    
    # Bundle composition analysis
    print_header "Bundle Composition"
    
    # JavaScript files
    JS_FILES=$(find dist-analysis/ -name "*.js" -o -name "*.hbc" | wc -l)
    print_info "JavaScript files: $JS_FILES"
    
    # Image files
    IMG_FILES=$(find dist-analysis/ -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.webp" | wc -l)
    print_info "Image files: $IMG_FILES"
    
    # Font files
    FONT_FILES=$(find dist-analysis/ -name "*.ttf" -o -name "*.otf" -o -name "*.woff" -o -name "*.woff2" | wc -l)
    print_info "Font files: $FONT_FILES"
    
    # Expected vs Actual Analysis
    print_header "Size Expectations"
    
    # Convert sizes to MB for comparison
    TOTAL_MB=$(echo "$TOTAL_SIZE" | sed 's/M//' | sed 's/K/0.001/' | sed 's/G/1000/')
    
    if (( $(echo "$TOTAL_MB > 8" | bc -l) )); then
        print_success "Bundle size is normal for a feature-rich React Native app ($TOTAL_SIZE)"
    elif (( $(echo "$TOTAL_MB < 5" | bc -l) )); then
        print_error "Bundle size seems too small ($TOTAL_SIZE) - assets might be missing!"
        print_warning "Expected size for CalorAi: 8-15 MB"
        print_warning "This could indicate missing dependencies or assets"
    else
        print_warning "Bundle size is smaller than expected ($TOTAL_SIZE)"
        print_info "Expected size for CalorAi: 8-15 MB"
    fi
    
    # Recommendations
    print_header "Recommendations"
    
    if (( $(echo "$TOTAL_MB < 8" | bc -l) )); then
        echo "🔍 Potential Issues:"
        echo "  1. Vector icon fonts might not be bundled properly"
        echo "  2. Some dependencies might be missing from the build"
        echo "  3. Assets might not be included in the bundle"
        echo "  4. Metro bundler might be excluding some files"
        echo ""
        echo "🛠️  Solutions to try:"
        echo "  1. Run: eas build --profile preview --platform android --clear-cache"
        echo "  2. Check that all dependencies are properly installed"
        echo "  3. Verify assetBundlePatterns in app.json includes all assets"
        echo "  4. Check Metro configuration for asset exclusions"
    else
        print_success "Bundle size appears normal"
        echo "🚀 Ready for deployment!"
    fi
    
    print_header "Analysis Complete!"
    print_info "Analysis results saved in dist-analysis/ directory"
    print_info "You can inspect the contents to verify all assets are included"
}

# Run main function
main "$@"
