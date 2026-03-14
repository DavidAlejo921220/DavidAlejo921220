import { test, expect } from '@playwright/test';
import { waitForAppReady, dismissToasts, loginAsAdmin } from '../fixtures/helpers';

test.describe('Admin Dashboard and Management', () => {
  
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
    await loginAsAdmin(page);
  });

  test('admin dashboard shows statistics cards', async ({ page }) => {
    // Verify we're on admin dashboard
    await expect(page.getByTestId('dashboard-title')).toHaveText('Panel Administrativo');
    
    // Check all stat cards are visible
    await expect(page.getByTestId('stat-total-services')).toBeVisible();
    await expect(page.getByTestId('stat-active-services')).toBeVisible();
    await expect(page.getByTestId('stat-total-users')).toBeVisible();
    await expect(page.getByTestId('stat-total-drivers')).toBeVisible();
    
    // Check total revenue is displayed
    await expect(page.getByTestId('total-revenue')).toBeVisible();
  });

  test('admin dashboard navigation buttons work', async ({ page }) => {
    // Check nav buttons are visible
    await expect(page.getByTestId('users-nav-button')).toBeVisible();
    await expect(page.getByTestId('commission-nav-button')).toBeVisible();
    await expect(page.getByTestId('wallets-nav-button')).toBeVisible();
    await expect(page.getByTestId('logout-button')).toBeVisible();
  });

  test('admin can navigate to wallet management', async ({ page }) => {
    await page.getByTestId('wallets-nav-button').click();
    await page.waitForURL(/admin\/wallets/);
    
    // Check wallets page loaded
    await expect(page.getByTestId('wallets-table')).toBeVisible();
    await expect(page.getByTestId('back-button')).toBeVisible();
  });

  test('admin can navigate to users management', async ({ page }) => {
    await page.getByTestId('users-nav-button').click();
    await page.waitForURL(/admin\/users/);
    
    // Page should load
    await expect(page.locator('body')).toBeVisible();
  });

  test('admin can navigate to commission config', async ({ page }) => {
    await page.getByTestId('commission-nav-button').click();
    await page.waitForURL(/admin\/commission/);
    
    // Page should load
    await expect(page.locator('body')).toBeVisible();
  });

  test('admin logout works', async ({ page }) => {
    await page.getByTestId('logout-button').click();
    
    // Should redirect to login or landing
    await expect(page).toHaveURL(/\/(login)?$/);
  });
});

test.describe('Admin Wallet Management', () => {
  
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
    await loginAsAdmin(page);
    await page.goto('/admin/wallets');
    await waitForAppReady(page);
  });

  test('wallet management page shows driver list table', async ({ page }) => {
    await expect(page.getByTestId('wallets-table')).toBeVisible();
    
    // Check table headers
    const table = page.getByTestId('wallets-table');
    await expect(table.locator('th').first()).toBeVisible();
  });

  test('wallet management has back button that works', async ({ page }) => {
    await page.getByTestId('back-button').click();
    await page.waitForURL(/admin\/dashboard/);
    
    await expect(page.getByTestId('dashboard-title')).toBeVisible();
  });
});
