import { expect, test } from '@playwright/test'

test('signup and create ride journey', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Sign up (~10 sec)')).toBeVisible()
  await page.getByPlaceholder('netid@illinois.edu').fill('sample@illinois.edu')
  await page.getByRole('button', { name: 'Send code' }).click()
  const codeMsg = page.getByText(/Demo code:/)
  await expect(codeMsg).toBeVisible()
  const text = (await codeMsg.textContent()) ?? ''
  const code = text.split(':').pop()?.trim() ?? ''
  await page.getByPlaceholder('6-digit code').fill(code)
  await page.locator('input').nth(2).fill('Sample User')
  await page.getByPlaceholder('(XXX)-XXX-XXXX').fill('2173001234')
  await page.getByRole('button', { name: 'Verify and continue' }).click()
  await expect(page.getByText(/Logout @/)).toBeVisible()
})

