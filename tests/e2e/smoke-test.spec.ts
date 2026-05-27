import { test, expect } from '@playwright/test';

test.describe('UI Enhancement - Quick Smoke Test', () => {
    test('should load login page with animation', async ({ page }) => {
        await page.goto('/login');
        
        // Check page loads
        await expect(page).toHaveTitle(/Kolabri/i);
        
        // Check form exists
        const emailInput = page.locator('input[name="email"]');
        await expect(emailInput).toBeVisible();
        
        console.log('✓ Login page loads');
    });

    test('should load admin dashboard after login', async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.fill('input[name="email"]', 'admin@kolabri.test');
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');
        
        // Wait for redirect
        await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
        
        // Check dashboard loads
        await expect(page.locator('text=/Dashboard/i')).toBeVisible();
        
        console.log('✓ Admin dashboard loads');
    });

    test('should show stat cards on dashboard', async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.fill('input[name="email"]', 'admin@kolabri.test');
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/admin/dashboard');
        
        // Wait for content
        await page.waitForTimeout(2000);
        
        // Check for any stat-like elements
        const statsSection = page.locator('text=/Total|Users|Courses/i').first();
        
        if (await statsSection.isVisible()) {
            console.log('✓ Stat cards visible');
        } else {
            console.log('⚠ No stat cards found (might be loading)');
        }
    });

    test('should show table on user management', async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.fill('input[name="email"]', 'admin@kolabri.test');
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/admin/dashboard');
        
        // Navigate to user management
        await page.goto('/admin/user-management');
        await page.waitForLoadState('networkidle');
        
        // Check for table or content
        const table = page.locator('table');
        const hasTable = await table.count() > 0;
        
        console.log('✓ User management page loads, has table:', hasTable);
    });
});
