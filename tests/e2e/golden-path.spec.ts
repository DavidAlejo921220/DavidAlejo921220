import { test, expect } from '@playwright/test';
import { waitForAppReady, dismissToasts, loginAsAdmin, generateUniqueEmail, generateUniquePhone } from '../fixtures/helpers';

test.describe('Golden Path - End to End User Journeys', () => {
  
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
  });

  test('complete admin journey - login, view dashboard, wallets, logout', async ({ page }) => {
    // Step 1: Login as admin
    await loginAsAdmin(page);
    
    // Step 2: Verify dashboard loaded with all stats
    await expect(page.getByTestId('dashboard-title')).toHaveText('Panel Administrativo');
    await expect(page.getByTestId('stat-total-services')).toBeVisible();
    await expect(page.getByTestId('stat-total-users')).toBeVisible();
    await expect(page.getByTestId('stat-total-drivers')).toBeVisible();
    
    // Step 3: Navigate to wallet management
    await page.getByTestId('wallets-nav-button').click();
    await page.waitForURL(/admin\/wallets/);
    await expect(page.getByTestId('wallets-table')).toBeVisible();
    
    // Step 4: Navigate back to dashboard
    await page.getByTestId('back-button').click();
    await page.waitForURL(/admin\/dashboard/);
    await expect(page.getByTestId('dashboard-title')).toBeVisible();
    
    // Step 5: Logout
    await page.getByTestId('logout-button').click();
    await expect(page).toHaveURL(/\/(login)?$/);
  });

  test('complete driver registration and dashboard journey', async ({ page }) => {
    const uniqueEmail = await generateUniqueEmail();
    const uniquePhone = await generateUniquePhone();
    
    // Step 1: Register as driver
    await page.goto('/register?role=driver');
    await waitForAppReady(page);
    
    await page.getByTestId('register-name-input').fill('Golden Path Driver');
    await page.getByTestId('register-email-input').fill(uniqueEmail);
    await page.getByTestId('register-phone-input').fill(uniquePhone);
    await page.getByTestId('register-password-input').fill('GoldenPass123!');
    await page.getByTestId('register-submit-button').click();
    
    // Step 2: Should see OTP screen (email sent)
    await expect(page.getByTestId('otp-form')).toBeVisible({ timeout: 15000 });
    
    // Now login directly (skip OTP for testing - user is created)
    await page.goto('/login');
    await waitForAppReady(page);
    
    await page.getByTestId('login-email-input').fill(uniqueEmail);
    await page.getByTestId('login-password-input').fill('GoldenPass123!');
    await page.getByTestId('login-submit-button').click();
    
    // Step 3: Should reach driver dashboard
    await page.waitForURL(/driver\/dashboard/, { timeout: 15000 });
    await expect(page.getByTestId('dashboard-title')).toHaveText('Panel de Conductor');
    
    // Step 4: Check availability switch is present
    await expect(page.getByTestId('availability-switch')).toBeVisible();
    
    // Step 5: Check wallet stat is visible
    await expect(page.getByTestId('stat-wallet')).toBeVisible();
    
    // Step 6: Check view available services button
    await expect(page.getByTestId('view-available-button')).toBeVisible();
    
    // Step 7: Logout
    await page.getByTestId('logout-button').click();
    await expect(page).toHaveURL(/\/(login)?$/);
  });

  test('complete client registration journey', async ({ page }) => {
    const uniqueEmail = await generateUniqueEmail();
    const uniquePhone = await generateUniquePhone();
    
    // Step 1: Start from landing
    await page.goto('/');
    await waitForAppReady(page);
    
    // Step 2: Click register button
    await page.getByTestId('nav-register-button').click();
    await page.waitForURL(/register/);
    
    // Step 3: Fill registration form (default is client)
    await page.getByTestId('register-name-input').fill('Golden Path Client');
    await page.getByTestId('register-email-input').fill(uniqueEmail);
    await page.getByTestId('register-phone-input').fill(uniquePhone);
    await page.getByTestId('register-password-input').fill('ClientPass123!');
    await page.getByTestId('register-submit-button').click();
    
    // Step 4: OTP screen should appear
    await expect(page.getByTestId('otp-form')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('otp-input')).toBeVisible();
    await expect(page.getByTestId('otp-verify-button')).toBeVisible();
  });

  test('API health check from frontend context', async ({ page }) => {
    // Test that API is accessible
    const response = await page.request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.service).toBe('GruaApp API');
    expect(data.version).toBe('1.0.0');
  });

  test('protected routes redirect to login when not authenticated', async ({ page }) => {
    // Clear any stored auth
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });
    
    // Try to access protected client route
    await page.goto('/client/dashboard');
    await expect(page).toHaveURL(/login/);
    
    // Try to access protected driver route
    await page.goto('/driver/dashboard');
    await expect(page).toHaveURL(/login/);
    
    // Try to access protected admin route
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/login/);
  });
});
