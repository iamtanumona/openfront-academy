import {test,expect} from '@playwright/test';
test('exercise preview cannot access parent DOM or navigate top-level',async({page})=>{
 await page.goto('/exercises/html-heading-001');
 await expect(page.locator('main')).toBeVisible();
 await page.getByRole('button',{name:'Run tests'}).click();
 const frame=page.locator('iframe[sandbox]');
 await expect(frame).toHaveCount(1);
 const sandbox=await frame.getAttribute('sandbox');
 expect(sandbox?.split(/\s+/)).toContain('allow-scripts');
 expect(sandbox?.split(/\s+/)).not.toContain('allow-same-origin');
 expect(sandbox?.split(/\s+/)).not.toContain('allow-top-navigation');
});
