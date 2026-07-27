import { test, expect } from '@playwright/test'; test('dashboard basic check', async ({ page }) => { await page.goto('http://localhost:3000'); await expect(page).toHaveTitle(/NeuroSignal/); });
