import { expect, test } from '@playwright/test';

test('레이아웃에 푸터가 포함되어 있는지 확인', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('footer')).toBeVisible();
});
