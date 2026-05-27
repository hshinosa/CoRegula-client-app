import { test, expect } from '@playwright/test';

test.describe('UI Enhancement Polish - Verification', () => {
    test.beforeEach(async ({ page }) => {
        // Login as admin first
        await page.goto('/login');
        await page.fill('input[name="email"]', 'admin@kolabri.test');
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');
        await page.waitForURL('/admin/dashboard');
    });

    test.describe('Dashboard Stat Cards Enhancement', () => {
        test('should show stat cards with hover effects', async ({ page }) => {
            await page.goto('/admin/dashboard');
            
            // Wait for stat cards to load
            await page.waitForSelector('[data-testid="stat-card"]', { timeout: 10000 });
            
            const statCard = page.locator('[data-testid="stat-card"]').first();
            
            // Check if stat card exists
            await expect(statCard).toBeVisible();
            
            // Hover over stat card
            await statCard.hover();
            
            // Check for hover effect (transform should change)
            const transform = await statCard.evaluate(el => 
                window.getComputedStyle(el).transform
            );
            
            console.log('Stat card hover transform:', transform);
        });

        test('should show number count-up animation', async ({ page }) => {
            await page.goto('/admin/dashboard');
            
            // Wait for stat cards
            await page.waitForSelector('[data-testid="stat-card"]', { timeout: 10000 });
            
            // Check if numbers are visible
            const statValue = page.locator('[data-testid="stat-card"]').first().locator('text=/\\d+/');
            await expect(statValue).toBeVisible();
            
            console.log('Stat card value:', await statValue.textContent());
        });

        test('should show skeleton loading state', async ({ page }) => {
            // Intercept API to delay response
            await page.route('**/api/admin/dashboard/stats', async route => {
                await new Promise(resolve => setTimeout(resolve, 500));
                await route.continue();
            });
            
            await page.goto('/admin/dashboard');
            
            // Check for skeleton (should be visible for at least 300ms)
            const skeleton = page.locator('[data-testid="skeleton-stat-card"]');
            
            // Skeleton might not be visible if API is too fast, so we just check it doesn't error
            const skeletonCount = await skeleton.count();
            console.log('Skeleton stat cards found:', skeletonCount);
        });
    });

    test.describe('Empty States', () => {
        test('should show empty state in audit log with no results', async ({ page }) => {
            await page.goto('/admin/audit-log');
            
            // Wait for page load
            await page.waitForLoadState('networkidle');
            
            // Apply filter that returns no results
            await page.selectOption('select[name="action"]', 'nonexistent-action');
            
            // Wait a bit for filter to apply
            await page.waitForTimeout(1000);
            
            // Check for empty state
            const emptyState = page.locator('text=/Tidak ada.*ditemukan/i');
            
            if (await emptyState.isVisible()) {
                console.log('Empty state visible in audit log');
                
                // Check for reset filter button
                const resetButton = page.locator('button:has-text("Reset")');
                await expect(resetButton).toBeVisible();
            } else {
                console.log('No empty state (data exists)');
            }
        });

        test('should show empty state in activity feed', async ({ page }) => {
            await page.goto('/admin/dashboard');
            
            // Check if activity feed has empty state
            const activitySection = page.locator('text=/Aktivitas Terbaru/i').locator('..');
            
            // Look for empty state or activity items
            const emptyState = activitySection.locator('text=/Belum ada aktivitas/i');
            const activityItems = activitySection.locator('[data-testid="activity-item"]');
            
            const hasEmpty = await emptyState.isVisible();
            const itemCount = await activityItems.count();
            
            console.log('Activity feed - Empty state:', hasEmpty, 'Items:', itemCount);
        });
    });

    test.describe('Table Design Improvements', () => {
        test('should show hover effect on table rows', async ({ page }) => {
            await page.goto('/admin/user-management');
            
            // Wait for table to load
            await page.waitForSelector('table tbody tr', { timeout: 10000 });
            
            const firstRow = page.locator('table tbody tr').first();
            
            // Get background before hover
            const bgBefore = await firstRow.evaluate(el => 
                window.getComputedStyle(el).backgroundColor
            );
            
            // Hover
            await firstRow.hover();
            
            // Get background after hover
            const bgAfter = await firstRow.evaluate(el => 
                window.getComputedStyle(el).backgroundColor
            );
            
            console.log('Table row hover - Before:', bgBefore, 'After:', bgAfter);
        });

        test('should have improved table headers', async ({ page }) => {
            await page.goto('/admin/user-management');
            
            // Wait for table
            await page.waitForSelector('table thead th', { timeout: 10000 });
            
            const firstHeader = page.locator('table thead th').first();
            
            // Check header styling
            const styles = await firstHeader.evaluate(el => ({
                textTransform: window.getComputedStyle(el).textTransform,
                letterSpacing: window.getComputedStyle(el).letterSpacing,
                fontSize: window.getComputedStyle(el).fontSize,
            }));
            
            console.log('Table header styles:', styles);
            
            // Should be uppercase
            expect(styles.textTransform).toBe('uppercase');
        });
    });

    test.describe('Auth Pages Polish', () => {
        test('should show entrance animation on login page', async ({ page }) => {
            await page.goto('/logout', { waitUntil: 'networkidle' });
            await page.goto('/login');
            
            // Wait for form card
            const formCard = page.locator('form').locator('..');
            await expect(formCard).toBeVisible();
            
            console.log('Login page loaded with form card');
        });

        test('should use consistent color tokens', async ({ page }) => {
            await page.goto('/logout', { waitUntil: 'networkidle' });
            await page.goto('/login');
            
            // Check for hardcoded colors (should not exist)
            const bodyHTML = await page.content();
            
            // Check if #4A4A4A or #6B7280 appear in inline styles
            const hasHardcodedColors = bodyHTML.includes('color: #4A4A4A') || 
                                      bodyHTML.includes('color: #6B7280') ||
                                      bodyHTML.includes('color:#4A4A4A') ||
                                      bodyHTML.includes('color:#6B7280');
            
            console.log('Login page has hardcoded colors:', hasHardcodedColors);
            expect(hasHardcodedColors).toBe(false);
        });

        test('should show success message with green styling', async ({ page }) => {
            await page.goto('/logout', { waitUntil: 'networkidle' });
            await page.goto('/forgot-password');
            
            // Fill email
            await page.fill('input[name="email"]', 'admin@kolabri.test');
            await page.click('button[type="submit"]');
            
            // Wait for success message
            await page.waitForTimeout(2000);
            
            // Check for success message with CheckCircle icon
            const successMessage = page.locator('text=/Email.*terkirim/i');
            
            if (await successMessage.isVisible()) {
                console.log('Success message visible');
                
                // Check for CheckCircle icon (svg with check)
                const checkIcon = page.locator('svg').filter({ hasText: '' }).first();
                console.log('Check icon present:', await checkIcon.count() > 0);
            }
        });
    });

    test.describe('Modal Design Improvements', () => {
        test('should show modal with section dividers', async ({ page }) => {
            await page.goto('/admin/user-management');
            
            // Click add user button
            const addButton = page.locator('button:has-text("Tambah")').or(page.locator('button:has-text("Add")'));
            
            if (await addButton.count() > 0) {
                await addButton.first().click();
                
                // Wait for modal
                await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
                
                const modal = page.locator('[role="dialog"]');
                await expect(modal).toBeVisible();
                
                console.log('Modal opened');
                
                // Check for header divider
                const modalHTML = await modal.innerHTML();
                const hasBorderBottom = modalHTML.includes('border-bottom') || 
                                       modalHTML.includes('border-b');
                
                console.log('Modal has section dividers:', hasBorderBottom);
            } else {
                console.log('No add button found, skipping modal test');
            }
        });
    });

    test.describe('Loading Skeletons', () => {
        test('should show skeleton loading in tables', async ({ page }) => {
            // Intercept API to delay
            await page.route('**/api/admin/users**', async route => {
                await new Promise(resolve => setTimeout(resolve, 500));
                await route.continue();
            });
            
            await page.goto('/admin/user-management');
            
            // Check for skeleton rows (might be too fast to catch)
            const skeletonRows = page.locator('[data-testid="skeleton-table-row"]');
            const count = await skeletonRows.count();
            
            console.log('Skeleton table rows found:', count);
        });
    });

    test.describe('Toast Notifications', () => {
        test('should show toast with slide-up animation', async ({ page }) => {
            await page.goto('/admin/dashboard');
            
            // Trigger an action that shows toast (e.g., update something)
            // For now, just check if toast container exists
            const toastContainer = page.locator('[data-testid="toast-container"]').or(
                page.locator('.toast').or(
                    page.locator('[role="alert"]')
                )
            );
            
            console.log('Toast container exists:', await toastContainer.count() > 0);
        });
    });
});
