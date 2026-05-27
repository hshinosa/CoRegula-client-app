#!/bin/bash

echo "🔍 Verifying UI Enhancement Polish Implementation"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_file_exists() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        return 0
    else
        echo -e "${RED}✗${NC} $2 - File not found: $1"
        return 1
    fi
}

check_pattern_in_file() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $3"
        return 0
    else
        echo -e "${RED}✗${NC} $3"
        return 1
    fi
}

check_no_pattern_in_file() {
    if ! grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $3"
        return 0
    else
        echo -e "${RED}✗${NC} $3 - Pattern found: $2"
        return 1
    fi
}

echo "1️⃣  Reusable Components"
echo "----------------------"
check_file_exists "resources/js/components/ui/EmptyState.tsx" "EmptyState component exists"
check_file_exists "resources/js/components/dashboard/EnhancedStatCard.tsx" "EnhancedStatCard component exists"
check_pattern_in_file "resources/js/components/ui/skeletons.tsx" "SkeletonStatCard" "SkeletonStatCard in skeletons.tsx"
check_pattern_in_file "resources/js/components/ui/skeletons.tsx" "TableRowSkeleton" "TableRowSkeleton in skeletons.tsx"
check_pattern_in_file "resources/js/components/ui/skeletons.tsx" "SkeletonChart" "SkeletonChart in skeletons.tsx"
echo ""

echo "2️⃣  Auth Pages Polish"
echo "--------------------"
check_no_pattern_in_file "resources/js/pages/auth/login.tsx" "#4A4A4A\|#6B7280" "No hardcoded colors in login.tsx"
check_no_pattern_in_file "resources/js/pages/auth/register.tsx" "#4A4A4A\|#6B7280" "No hardcoded colors in register.tsx"
check_no_pattern_in_file "resources/js/pages/auth/verify-email.tsx" "#4A4A4A\|#6B7280" "No hardcoded colors in verify-email.tsx"
check_pattern_in_file "resources/js/pages/auth/login.tsx" "motion.div" "Motion animation in login.tsx"
check_pattern_in_file "resources/js/pages/auth/forgot-password.tsx" "CheckCircle" "CheckCircle icon in forgot-password.tsx"
echo ""

echo "3️⃣  Dashboard Stat Cards"
echo "-----------------------"
check_pattern_in_file "resources/js/pages/admin/dashboard.tsx" "hover:" "Hover effects in admin dashboard"
check_pattern_in_file "resources/js/pages/student/dashboard.tsx" "EnhancedStatCard" "EnhancedStatCard in student dashboard"
check_pattern_in_file "resources/js/pages/lecturer/dashboard.tsx" "EnhancedStatCard" "EnhancedStatCard in lecturer dashboard"
check_pattern_in_file "resources/js/components/dashboard/EnhancedStatCard.tsx" "countUp\|animate" "Count-up animation in EnhancedStatCard"
echo ""

echo "4️⃣  Loading Skeletons"
echo "--------------------"
check_pattern_in_file "resources/js/pages/admin/user-management.tsx" "showSkeleton\|300" "300ms minimum display in user-management"
check_pattern_in_file "resources/js/pages/admin/audit-log.tsx" "showSkeleton\|300" "300ms minimum display in audit-log"
check_pattern_in_file "resources/js/pages/admin/master-data.tsx" "showSkeleton\|300" "300ms minimum display in master-data"
check_pattern_in_file "resources/js/pages/lecturer/analytics/overview.tsx" "SkeletonChart" "SkeletonChart in lecturer analytics"
echo ""

echo "5️⃣  Empty States"
echo "---------------"
check_pattern_in_file "resources/js/pages/student/courses/index.tsx" "EmptyState" "EmptyState in student courses"
check_pattern_in_file "resources/js/components/dashboard/ActivityFeed.tsx" "EmptyState" "EmptyState in ActivityFeed"
check_pattern_in_file "resources/js/pages/student/chat-spaces/index.tsx" "EmptyState" "EmptyState in chat-spaces"
check_pattern_in_file "resources/js/pages/student/reflections/index.tsx" "EmptyState" "EmptyState in reflections"
check_pattern_in_file "resources/js/pages/admin/audit-log.tsx" "EmptyState" "EmptyState in audit-log"
check_pattern_in_file "resources/js/pages/lecturer/groups/index.tsx" "EmptyState" "EmptyState in lecturer groups"
echo ""

echo "6️⃣  Table Design"
echo "---------------"
check_pattern_in_file "resources/js/pages/admin/user-management.tsx" "hover:bg-\[var(--dm-surface-hover)\]" "Hover state in user-management table"
check_pattern_in_file "resources/js/pages/admin/audit-log.tsx" "hover:bg-\[var(--dm-surface-hover)\]" "Hover state in audit-log table"
check_pattern_in_file "resources/js/pages/admin/user-management.tsx" "uppercase.*tracking-wider" "Improved headers in user-management"
echo ""

echo "7️⃣  Modal Design"
echo "---------------"
check_pattern_in_file "resources/js/pages/admin/user-management.tsx" "border-\[var(--dm-border)\]" "Modal dividers in user-management"
check_pattern_in_file "resources/js/pages/admin/user-management.tsx" "backdrop-filter.*blur" "Backdrop blur in modals"
echo ""

echo "8️⃣  Toast Notifications"
echo "----------------------"
check_pattern_in_file "resources/js/components/ui/ToastNotification.tsx" "action.*label.*onClick" "Action button support in toast"
check_pattern_in_file "resources/js/components/ui/ToastNotification.tsx" "initial.*y.*20" "Slide-up animation in toast"
check_pattern_in_file "resources/js/components/ui/ToastNotification.tsx" "5000\|progress" "5s auto-dismiss with progress bar"
check_pattern_in_file "resources/js/components/ui/ToastNotification.tsx" "warning" "Warning type support in toast"
echo ""

echo "================================================"
echo "✅ Verification Complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Start Laravel app: php artisan serve"
echo "   2. Open browser and manually verify UI changes"
echo "   3. Check UI-ENHANCEMENT-VERIFICATION.md for detailed checklist"
echo ""
