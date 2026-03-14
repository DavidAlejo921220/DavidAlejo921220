import { test, expect } from '@playwright/test';
import { waitForAppReady, dismissToasts } from '../fixtures/helpers';

test.describe('Core Flows - Landing, Auth, Navigation', () => {
  
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
  });

  test('landing page loads with main elements', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    
    // Check page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Look for main heading text - GruaApp using role
    await expect(page.getByRole('heading', { name: /GruaApp.*Tu Grúa/i })).toBeVisible();
    
    // Check for the two main CTAs
    await expect(page.getByText('NECESITO UNA GRÚA')).toBeVisible();
    await expect(page.getByText('SOY CONDUCTOR')).toBeVisible();
    
    // Check header nav using data-testid
    await expect(page.getByTestId('nav-register-button')).toBeVisible();
  });

  test('login page loads with form elements', async ({ page }) => {
    await page.goto('/login');
    await waitForAppReady(page);
    
    // Check form elements exist
    await expect(page.getByTestId('login-form')).toBeVisible();
    await expect(page.getByTestId('login-email-input')).toBeVisible();
    await expect(page.getByTestId('login-password-input')).toBeVisible();
    await expect(page.getByTestId('login-submit-button')).toBeVisible();
  });

  test('admin login flow works', async ({ page }) => {
    await page.goto('/login');
    await waitForAppReady(page);
    
    await page.getByTestId('login-email-input').fill('admin@gruaapp.com');
    await page.getByTestId('login-password-input').fill('Admin2026!');
    await page.getByTestId('login-submit-button').click();
    
    // Should redirect to admin dashboard
    await page.waitForURL(/admin\/dashboard/, { timeout: 15000 });
    
    // Verify dashboard loaded
    await expect(page.getByTestId('dashboard-title')).toHaveText('Panel Administrativo');
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await waitForAppReady(page);
    
    await page.getByTestId('login-email-input').fill('wrong@email.com');
    await page.getByTestId('login-password-input').fill('wrongpassword');
    await page.getByTestId('login-submit-button').click();
    
    // Should see error toast
    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 10000 });
  });

  test('register page loads with form elements', async ({ page }) => {
    await page.goto('/register');
    await waitForAppReady(page);
    
    await expect(page.getByTestId('register-form')).toBeVisible();
    await expect(page.getByTestId('register-role-select')).toBeVisible();
    await expect(page.getByTestId('register-name-input')).toBeVisible();
    await expect(page.getByTestId('register-email-input')).toBeVisible();
    await expect(page.getByTestId('register-phone-input')).toBeVisible();
    await expect(page.getByTestId('register-password-input')).toBeVisible();
    await expect(page.getByTestId('register-submit-button')).toBeVisible();
  });

  test('navigation from landing to login works', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    
    await page.getByText('Iniciar Sesión').click();
    await page.waitForURL(/login/);
    
    await expect(page.getByTestId('login-form')).toBeVisible();
  });

  test('navigation from landing to register works', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    
    await page.getByTestId('nav-register-button').click();
    await page.waitForURL(/register/);
    
    await expect(page.getByTestId('register-form')).toBeVisible();
  });
});
