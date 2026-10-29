import {test,expect} from '@playwright/test';
const solution='def move_zeroes(nums):\n    write = 0\n    for read in range(len(nums)):\n        if nums[read] != 0:\n            nums[write], nums[read] = nums[read], nums[write]\n            write += 1';
async function edit(page,code){const editor=page.locator('.cm-content');await editor.click();await page.keyboard.press('ControlOrMeta+A');await page.keyboard.insertText(code);}
test('one question at a time, real execution, and next concept',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'Move Zeroes',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Run examples'})).toBeDisabled();
 await expect(page.getByRole('button',{name:/Reverse an Array/})).toBeDisabled();
 await page.getByRole('button',{name:'Start question',exact:true}).click();
 await edit(page,solution);
 await page.getByRole('button',{name:'Run examples'}).click();
 await expect(page.getByText('Examples passed — submit to complete this question.')).toBeVisible();
 await expect(page.getByRole('button',{name:'Next concept'})).toHaveCount(0);
 await page.reload();
 await expect(page.getByRole('button',{name:'Run examples'})).toBeEnabled();
 await expect(page.locator('.cm-content')).toContainText('write += 1');
 await page.getByRole('button',{name:'Submit solution'}).click();
 await expect(page.getByText('Accepted — concept mastered!')).toBeVisible();
 await expect(page.getByRole('button',{name:'Submit solution'})).toBeDisabled();
 await page.getByRole('button',{name:'Next concept'}).click();
 await expect(page.getByRole('heading',{name:'Reverse an Array',exact:true})).toBeVisible();
 await expect(page.getByRole('timer')).toHaveText('20:00');
 await expect(page.getByRole('button',{name:'Run examples'})).toBeDisabled();
});
test('timeout replaces within the same concept, including after reload',async({page})=>{
 await page.clock.install();await page.goto('/');
 await page.getByRole('button',{name:'Start question',exact:true}).click();
 await page.clock.fastForward(10000);
 await expect(page.getByRole('timer')).toHaveText('29:50');
 await page.reload();await expect(page.getByRole('timer')).toHaveText('29:50');
 await page.clock.fastForward(1790000);
 await expect(page.getByRole('heading',{name:'Move a Value to the End',exact:true})).toBeVisible();
 await expect(page.getByText(/Time’s up on Move Zeroes/)).toBeVisible();
 await expect(page.getByRole('button',{name:'Submit solution'})).toBeDisabled();
 await expect(page.getByText('Concept 1 / 5',{exact:true})).toBeVisible();
});
test('hints and chapter lesson include methods, uses, and an accessible image',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'Reveal hint 1 of 3'}).click();
 await expect(page.getByText('Track the part of the list you have already placed correctly.')).toBeVisible();
 await page.getByRole('button',{name:'Learn: Arrays & In-place'}).click();
 const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
 await expect(dialog.getByRole('img')).toBeVisible();await expect(dialog.getByText('append(x) / pop()',{exact:true})).toBeVisible();
 await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();
});
test('mobile layout fits viewport and has real empty activity',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.getByRole('heading',{name:'Move Zeroes',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await expect(page.getByText('0 submissions',{exact:false})).toBeVisible();
});
