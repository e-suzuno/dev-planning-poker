import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display main elements', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.getByRole('heading', { name: /planning poker/i })).toBeVisible()
    
    await expect(page.getByRole('button', { name: /セッション作成/i })).toBeVisible()
    
    await expect(page.getByRole('button', { name: /参加/i })).toBeVisible()
    await expect(page.getByPlaceholder(/セッションIDを入力/i)).toBeVisible()
  })
})
