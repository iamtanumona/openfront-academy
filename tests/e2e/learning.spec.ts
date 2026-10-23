import {test,expect} from '@playwright/test';
test('homepage and tracks are accessible by keyboard',async({page})=>{
 await page.goto('/');
 await expect(page.locator('main')).toBeVisible();
 await page.keyboard.press('Tab');
 await expect(page.locator(':focus')).toBeVisible();
 await page.goto('/tracks');
 await expect(page.locator('main')).toBeVisible();
});
test('lesson navigation exposes heading',async({page})=>{
 await page.goto('/tracks');
 await expect(page.getByRole('heading').first()).toBeVisible();
});
