import { expect, test } from '@playwright/test';

test('메인 페이지에 GraphQL 응답이 포함되어 있는지 확인 (SSR)', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByText('world')).toBeVisible();
});

test('메인 페이지에 GraphQL 응답이 포함되어 있는지 확인 (CSR)', async ({
  page,
}) => {
  await page.goto('/db');
  await page.getByText('Home').click();
  await expect(page.getByText('world')).toBeVisible();
});
