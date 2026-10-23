import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for(const route of ['/','/tracks']){
 test(`WCAG automated scan ${route}`,async({page})=>{
  await page.goto(route);
  const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(report.violations).toEqual([]);
 });
}
