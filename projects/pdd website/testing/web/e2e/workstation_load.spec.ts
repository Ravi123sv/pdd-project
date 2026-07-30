import { test, expect } from '@playwright/test'; test('Web Workstation Load', async ({ page }) => { await page.goto('http://localhost:3000'); await expect(page).toHaveTitle(/NeuroSignal/); });
