import { test, expect } from '@playwright/test';
import { waitForAppReady, dismissToasts, generateUniqueEmail, generateUniquePhone } from '../fixtures/helpers';

test.describe('User Registration Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
  });

  test('client registration shows OTP screen after submit', async ({ page }) => {
    await page.goto('/register');
    await waitForAppReady(page);
    
    const uniqueEmail = await generateUniqueEmail();
    const uniquePhone = await generateUniquePhone();
    
    // Fill registration form
    await page.getByTestId('register-name-input').fill('Test Client E2E');
    await page.getByTestId('register-email-input').fill(uniqueEmail);
    await page.getByTestId('register-phone-input').fill(uniquePhone);
    await page.getByTestId('register-password-input').fill('TestPass123!');
    
    // Submit form
    await page.getByTestId('register-submit-button').click();
    
    // Should show OTP verification form
    await expect(page.getByTestId('otp-form')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('otp-input')).toBeVisible();
    await expect(page.getByTestId('otp-verify-button')).toBeVisible();
  });

  test('driver registration shows OTP screen after submit', async ({ page }) => {
    await page.goto('/register?role=driver');
    await waitForAppReady(page);
    
    const uniqueEmail = await generateUniqueEmail();
    const uniquePhone = await generateUniquePhone();
    
    // Fill registration form
    await page.getByTestId('register-name-input').fill('Test Driver E2E');
    await page.getByTestId('register-email-input').fill(uniqueEmail);
    await page.getByTestId('register-phone-input').fill(uniquePhone);
    await page.getByTestId('register-password-input').fill('DriverPass123!');
    
    // Submit form
    await page.getByTestId('register-submit-button').click();
    
    // Should show OTP verification form
    await expect(page.getByTestId('otp-form')).toBeVisible({ timeout: 15000 });
  });

  test('registration with existing email shows error', async ({ page }) => {
    await page.goto('/register');
    await waitForAppReady(page);
    
    const uniquePhone = await generateUniquePhone();
    
    // Fill with existing admin email
    await page.getByTestId('register-name-input').fill('Duplicate User');
    await page.getByTestId('register-email-input').fill('admin@gruaapp.com');
    await page.getByTestId('register-phone-input').fill(uniquePhone);
    await page.getByTestId('register-password-input').fill('TestPass123!');
    
    // Submit form
    await page.getByTestId('register-submit-button').click();
    
    // Should show error toast
    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 10000 });
  });

  test('role selector allows switching between client and driver', async ({ page }) => {
    await page.goto('/register');
    await waitForAppReady(page);
    
    // Click role selector
    await page.getByTestId('register-role-select').click();
    
    // Should show options - use role selector in dropdown
    await expect(page.getByRole('option', { name: /Cliente.*Necesito grúa/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /Conductor.*Tengo grúa/i })).toBeVisible();
    
    // Select driver
    await page.getByRole('option', { name: /Conductor.*Tengo grúa/i }).click();
    
    // Verify selection changed
    await expect(page.getByTestId('register-role-select')).toContainText('Conductor');
  });
});

test.describe('Driver Dashboard Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
  });

  test('driver login redirects to driver dashboard', async ({ page }) => {
    // First create a driver via API
    const uniqueEmail = await generateUniqueEmail();
    const uniquePhone = await generateUniquePhone();
    
    // Register driver via API
    const registerResponse = await page.request.post('/api/auth/register', {
      data: {
        email: uniqueEmail,
        password: 'DriverPass123!',
        full_name: 'E2E Test Driver',
        phone: uniquePhone,
        role: 'driver'
      }
    });
    
    expect(registerResponse.ok()).toBeTruthy();
    
    // Now login via UI
    await page.goto('/login');
    await waitForAppReady(page);
    
    await page.getByTestId('login-email-input').fill(uniqueEmail);
    await page.getByTestId('login-password-input').fill('DriverPass123!');
    await page.getByTestId('login-submit-button').click();
    
    // Should redirect to driver dashboard
    await page.waitForURL(/driver\/dashboard/, { timeout: 15000 });
    
    // Verify dashboard elements
    await expect(page.getByTestId('dashboard-title')).toHaveText('Panel de Conductor');
    await expect(page.getByTestId('availability-switch')).toBeVisible();
    await expect(page.getByTestId('view-available-button')).toBeVisible();
  });
});
