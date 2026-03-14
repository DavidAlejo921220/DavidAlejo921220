import { Page, expect } from '@playwright/test';

export async function waitForAppReady(page: Page) {
  await page.waitForLoadState('domcontentloaded');
}

export async function dismissToasts(page: Page) {
  await page.addLocatorHandler(
    page.locator('[data-sonner-toast], .Toastify__toast, [role="status"].toast, .MuiSnackbar-root'),
    async () => {
      const close = page.locator('[data-sonner-toast] [data-close], [data-sonner-toast] button[aria-label="Close"], .Toastify__close-button, .MuiSnackbar-root button');
      await close.first().click({ timeout: 2000 }).catch(() => {});
    },
    { times: 10, noWaitAfter: true }
  );
}

export async function checkForErrors(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const errorElements = Array.from(
      document.querySelectorAll('.error, [class*="error"], [id*="error"]')
    );
    return errorElements.map(el => el.textContent || '').filter(Boolean);
  });
}

export async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  await page.getByTestId('login-email-input').fill('admin@gruaapp.com');
  await page.getByTestId('login-password-input').fill('Admin2026!');
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL(/admin\/dashboard/);
}

export async function generateUniqueEmail(): Promise<string> {
  const timestamp = Date.now();
  return `test_user_${timestamp}@test.com`;
}

export async function generateUniquePhone(): Promise<string> {
  const timestamp = Date.now().toString().slice(-10);
  return `3${timestamp}`;
}
