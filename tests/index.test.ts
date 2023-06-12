import { expect, test } from '@playwright/test';

test('메인 페이지에 GraphQL 응답이 포함되어 있는지 확인 (SSR)', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByText('Hello world!')).toBeVisible();
  await expect(page.locator('main code')).toHaveText('Hello world!');
});

test('메인 페이지에 GraphQL 응답이 포함되어 있는지 확인 (CSR)', async ({
  page,
}) => {
  await page.goto('/search?q=1');
  await page.locator('header a[href="/"]').click();
  await expect(page.locator('main code')).toHaveText('Hello world!');
});
