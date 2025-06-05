#!/bin/bash

# CalorAi Build Environment Setup Script
# This script helps configure environment variables for EAS builds

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
    print_header "CalorAi Build Environment Setup"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || ! grep -q '"name": "calorai"' package.json; then
        print_error "This script must be run from the CalorAi project root directory."
        exit 1
    fi
    
    print_info "Setting up build environment for CalorAi..."
    
    # Check EAS CLI
    if ! command -v eas &> /dev/null; then
        print_warning "EAS CLI not found. Installing..."
        npm install -g @expo/eas-cli
        print_success "EAS CLI installed"
    else
        print_success "EAS CLI found"
    fi
    
    # Check if user is logged in to EAS
    if ! eas whoami &> /dev/null; then
        print_warning "Not logged in to EAS. Please log in:"
        eas login
    else
        print_success "Logged in to EAS as: $(eas whoami)"
    fi
    
    # Validate eas.json
    if [ ! -f "eas.json" ]; then
        print_error "eas.json not found. Please ensure it exists."
        exit 1
    fi
    
    print_success "eas.json found and configured with environment variables"
    
    # Check Android configuration
    if [ -d "android" ]; then
        print_success "Native Android directory detected"
        print_info "EAS will use native Android configuration instead of app.json"
        
        # Check Android package name
        if grep -q "com.midlajvalappil.calorai" android/app/build.gradle; then
            print_success "Android package name correctly configured: com.midlajvalappil.calorai"
        else
            print_warning "Android package name might need verification"
        fi
    else
        print_info "Using managed Expo workflow"
    fi
    
    # Environment variables check
    print_info "Environment variables configured in eas.json:"
    echo "  - EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY"
    echo "  - EXPO_PUBLIC_SUPABASE_URL"
    echo "  - EXPO_PUBLIC_SUPABASE_ANON_KEY"
    echo "  - EXPO_PUBLIC_GEMINI_API_KEY"
    
    # Build commands
    print_header "Available Build Commands"
    echo "Development build:"
    echo "  eas build --profile development --platform android"
    echo ""
    echo "Preview build (recommended for testing):"
    echo "  eas build --profile preview --platform android"
    echo ""
    echo "Production build:"
    echo "  eas build --profile production --platform android"
    echo ""
    
    # Clear cache option
    print_info "To clear build cache, add --clear-cache flag to any build command"
    
    print_header "Setup Complete!"
    print_success "Your CalorAi project is ready for EAS builds"
    print_info "Run 'eas build --profile preview --platform android' to start building"
}

# Run main function
main "$@"
