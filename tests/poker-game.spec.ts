import { test, expect } from '@playwright/test';

test.describe('Planning Poker Application', () => {
  test('should load the main page and display poker game', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/Planning Poker/);
    await expect(page.locator('h1')).toContainText('Planning Poker');
    
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
    await expect(page.locator('[data-testid="community-cards"]')).toBeVisible();
  });

  test('should display player hands with cards', async ({ page }) => {
    await page.goto('/');
    
    const playerHands = page.locator('[data-testid="player-hand"]');
    await expect(playerHands).toHaveCount(4);
    
    const firstPlayerHand = playerHands.first();
    await expect(firstPlayerHand).toBeVisible();
    await expect(firstPlayerHand.locator('[data-testid="card"]')).toHaveCount(2);
  });

  test('should allow player actions when it is their turn', async ({ page }) => {
    await page.goto('/');
    
    const actionButtons = page.locator('[data-testid="action-buttons"]');
    await expect(actionButtons).toBeVisible();
    
    await expect(page.locator('button:has-text("Fold")')).toBeVisible();
    await expect(page.locator('button:has-text("Call")')).toBeVisible();
    await expect(page.locator('button:has-text("Raise")')).toBeVisible();
  });

  test('should navigate to multiplayer page', async ({ page }) => {
    await page.goto('/');
    
    await page.click('a[href="/multiplayer"]');
    await expect(page).toHaveURL('/multiplayer');
    
    await expect(page.locator('h1')).toContainText('Join Poker Game');
    await expect(page.locator('input[placeholder="Enter game ID"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Enter player ID"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Enter your name"]')).toBeVisible();
  });

  test('should generate random IDs in multiplayer form', async ({ page }) => {
    await page.goto('/multiplayer');
    
    const gameIdInput = page.locator('input[placeholder="Enter game ID"]');
    const playerIdInput = page.locator('input[placeholder="Enter player ID"]');
    
    await page.click('button:has-text("Generate"):near(input[placeholder="Enter game ID"])');
    await expect(gameIdInput).not.toHaveValue('');
    
    await page.click('button:has-text("Generate"):near(input[placeholder="Enter player ID"])');
    await expect(playerIdInput).not.toHaveValue('');
  });

  test('should validate multiplayer form submission', async ({ page }) => {
    await page.goto('/multiplayer');
    
    const joinButton = page.locator('button:has-text("Join Game")');
    
    await joinButton.click();
    
    const gameIdInput = page.locator('input[placeholder="Enter game ID"]');
    const playerIdInput = page.locator('input[placeholder="Enter player ID"]');
    const nameInput = page.locator('input[placeholder="Enter your name"]');
    
    await expect(gameIdInput).toHaveAttribute('required');
    await expect(playerIdInput).toHaveAttribute('required');
    await expect(nameInput).toHaveAttribute('required');
  });
});
