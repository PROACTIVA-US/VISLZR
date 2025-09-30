/**
 * E2E tests for sibling nodes functionality.
 * Tests the complete user flow: select node → siblings appear → click action → action executes
 *
 * Prerequisites:
 * - Playwright installed: npm install -D @playwright/test
 * - Dev server running on http://localhost:5173
 *
 * Run with: npx playwright test tests/e2e/sibling-nodes.spec.ts
 */

import { test, expect, Page } from '@playwright/test';

// Helper function to wait for canvas to be ready
async function waitForCanvasReady(page: Page) {
  await page.waitForSelector('canvas, svg', { timeout: 10000 });
  // Wait for D3.js simulation to settle
  await page.waitForTimeout(1000);
}

// Helper to find and click a node on the canvas
async function clickNodeOnCanvas(page: Page, nodeLabel: string) {
  // Find the node by its label text
  const node = page.locator(`text="${nodeLabel}"`).first();
  await node.waitFor({ state: 'visible', timeout: 5000 });
  await node.click();
}

// Helper to count visible sibling nodes
async function countSiblingNodes(page: Page) {
  const siblings = page.locator('.sibling-node');
  return await siblings.count();
}

test.describe('Sibling Nodes - User Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to project canvas
    await page.goto('http://localhost:5173');

    // Wait for auth/redirect if needed
    await page.waitForLoadState('networkidle');

    // Navigate to a test project (adjust URL as needed)
    const projectLink = page.locator('text=/Test Project|Demo Project/i').first();
    if (await projectLink.isVisible()) {
      await projectLink.click();
    }

    await waitForCanvasReady(page);
  });

  test('should display sibling nodes when a node is selected', async ({ page }) => {
    // Click a node on the canvas
    await clickNodeOnCanvas(page, 'Root');

    // Wait for siblings to appear
    await page.waitForSelector('.sibling-node', { timeout: 5000 });

    // Verify siblings are visible
    const siblingCount = await countSiblingNodes(page);
    expect(siblingCount).toBeGreaterThan(0);

    // Verify animation completed (siblings should be fully visible)
    const firstSibling = page.locator('.sibling-node').first();
    const opacity = await firstSibling.evaluate((el) =>
      window.getComputedStyle(el).opacity
    );
    expect(parseFloat(opacity)).toBeCloseTo(1, 1);
  });

  test('should hide sibling nodes when clicking canvas background', async ({ page }) => {
    // Select a node
    await clickNodeOnCanvas(page, 'Root');
    await page.waitForSelector('.sibling-node', { timeout: 5000 });

    // Click canvas background
    const canvas = page.locator('svg, canvas').first();
    await canvas.click({ position: { x: 50, y: 50 } });

    // Wait for siblings to disappear
    await page.waitForTimeout(500);

    // Verify siblings are hidden or removed
    const siblingCount = await countSiblingNodes(page);
    expect(siblingCount).toBe(0);
  });

  test('should execute action when sibling is clicked', async ({ page }) => {
    // Select a node
    await clickNodeOnCanvas(page, 'Root');
    await page.waitForSelector('.sibling-node', { timeout: 5000 });

    // Click "Add Task" sibling
    const addTaskSibling = page.locator('.sibling-node:has-text("Add")').first();
    await addTaskSibling.click();

    // Wait for modal/dialog or action confirmation
    const modal = page.locator('[role="dialog"], .modal').first();
    await modal.waitFor({ state: 'visible', timeout: 3000 });

    // Verify modal is displayed
    expect(await modal.isVisible()).toBe(true);
  });

  test('should show different actions for different node types', async ({ page }) => {
    // Click a task node
    await clickNodeOnCanvas(page, 'Task 1');
    await page.waitForSelector('.sibling-node', { timeout: 5000 });

    const taskActions = await page.locator('.sibling-node').allTextContents();

    // Click canvas to deselect
    const canvas = page.locator('svg, canvas').first();
    await canvas.click({ position: { x: 50, y: 50 } });
    await page.waitForTimeout(500);

    // Click a different node type (e.g., file)
    await clickNodeOnCanvas(page, 'index.ts');
    await page.waitForSelector('.sibling-node', { timeout: 5000 });

    const fileActions = await page.locator('.sibling-node').allTextContents();

    // Verify actions are different
    expect(taskActions).not.toEqual(fileActions);
  });

  test('should expand grouped siblings', async ({ page }) => {
    // Select a node
    await clickNodeOnCanvas(page, 'Root');
    await page.waitForSelector('.sibling-node', { timeout: 5000 });

    // Find and click a group parent (e.g., "Create", "Scans")
    const groupSibling = page.locator('.sibling-node:has-text("Create")').first();

    if (await groupSibling.isVisible()) {
      const initialCount = await countSiblingNodes(page);

      // Click to expand
      await groupSibling.click();
      await page.waitForTimeout(500);

      // Verify more siblings appeared
      const expandedCount = await countSiblingNodes(page);
      expect(expandedCount).toBeGreaterThan(initialCount);
    }
  });

  test('should animate siblings with stagger effect', async ({ page }) => {
    // Select a node
    await clickNodeOnCanvas(page, 'Root');

    // Start measuring animation timing
    const startTime = Date.now();

    // Wait for first sibling to appear
    await page.waitForSelector('.sibling-node', { timeout: 5000 });

    // Wait for all siblings to be fully visible
    await page.waitForTimeout(500);

    const endTime = Date.now();
    const animationDuration = endTime - startTime;

    // Verify animation completed within reasonable time
    // Spec target: <300ms + stagger (50ms per sibling)
    // Allow up to 1000ms for 5 siblings
    expect(animationDuration).toBeLessThan(1000);
  });

  test('should highlight sibling on hover', async ({ page }) => {
    // Select a node
    await clickNodeOnCanvas(page, 'Root');
    await page.waitForSelector('.sibling-node', { timeout: 5000 });

    const firstSibling = page.locator('.sibling-node').first();

    // Get initial transform
    const initialTransform = await firstSibling.evaluate((el) =>
      el.getAttribute('transform')
    );

    // Hover over sibling
    await firstSibling.hover();
    await page.waitForTimeout(200); // Wait for hover animation

    // Get transform after hover
    const hoveredTransform = await firstSibling.evaluate((el) =>
      el.getAttribute('transform')
    );

    // Verify transform changed (scale applied)
    expect(hoveredTransform).not.toBe(initialTransform);
  });
});

test.describe('Sibling Nodes - Visual Regression', () => {
  test('should render siblings in arc layout', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Navigate to test project
    const projectLink = page.locator('text=/Test Project|Demo Project/i').first();
    if (await projectLink.isVisible()) {
      await projectLink.click();
    }

    await waitForCanvasReady(page);

    // Select a node
    await clickNodeOnCanvas(page, 'Root');
    await page.waitForSelector('.sibling-node', { timeout: 5000 });
    await page.waitForTimeout(500); // Wait for animation

    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot('siblings-arc-layout.png', {
      maxDiffPixels: 100,
    });
  });

  test('should render siblings in stack layout', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Navigate to test project
    const projectLink = page.locator('text=/Test Project|Demo Project/i').first();
    if (await projectLink.isVisible()) {
      await projectLink.click();
    }

    await waitForCanvasReady(page);

    // Select a node with many actions (should use stack layout)
    await clickNodeOnCanvas(page, 'Service');
    await page.waitForSelector('.sibling-node', { timeout: 5000 });
    await page.waitForTimeout(500);

    // Take screenshot
    await expect(page).toHaveScreenshot('siblings-stack-layout.png', {
      maxDiffPixels: 100,
    });
  });
});

test.describe('Sibling Nodes - Performance', () => {
  test('should render siblings within 300ms', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Navigate to test project
    const projectLink = page.locator('text=/Test Project|Demo Project/i').first();
    if (await projectLink.isVisible()) {
      await projectLink.click();
    }

    await waitForCanvasReady(page);

    // Measure sibling render time
    const startTime = await page.evaluate(() => performance.now());

    await clickNodeOnCanvas(page, 'Root');
    await page.waitForSelector('.sibling-node', { timeout: 5000 });

    const endTime = await page.evaluate(() => performance.now());
    const renderTime = endTime - startTime;

    // Verify render time meets spec target (<300ms)
    expect(renderTime).toBeLessThan(300);
  });

  test('should maintain 60fps during animation', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Navigate to test project
    const projectLink = page.locator('text=/Test Project|Demo Project/i').first();
    if (await projectLink.isVisible()) {
      await projectLink.click();
    }

    await waitForCanvasReady(page);

    // Start performance monitoring
    await page.evaluate(() => {
      (window as any).frameCount = 0;
      (window as any).frameTimestamps = [];

      const countFrames = () => {
        (window as any).frameCount++;
        (window as any).frameTimestamps.push(performance.now());
        requestAnimationFrame(countFrames);
      };

      requestAnimationFrame(countFrames);
    });

    // Trigger sibling animation
    await clickNodeOnCanvas(page, 'Root');
    await page.waitForSelector('.sibling-node', { timeout: 5000 });
    await page.waitForTimeout(500); // Wait for full animation

    // Calculate FPS
    const stats = await page.evaluate(() => {
      const timestamps = (window as any).frameTimestamps;
      if (timestamps.length < 2) return { fps: 0 };

      const duration = timestamps[timestamps.length - 1] - timestamps[0];
      const fps = ((timestamps.length - 1) / duration) * 1000;

      return { fps, frameCount: timestamps.length };
    });

    // Verify FPS is close to 60
    expect(stats.fps).toBeGreaterThan(50); // Allow some variance
  });

  test('should handle large graphs without lag', async ({ page }) => {
    // This test assumes a large graph exists
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Navigate to large project (500+ nodes)
    const largeProjectLink = page.locator('text=/Large Project|Complex/i').first();
    if (await largeProjectLink.isVisible()) {
      await largeProjectLink.click();
      await waitForCanvasReady(page);

      // Select a node
      const startTime = Date.now();
      await clickNodeOnCanvas(page, 'Root');
      await page.waitForSelector('.sibling-node', { timeout: 5000 });
      const endTime = Date.now();

      const renderTime = endTime - startTime;

      // Verify no significant lag even on large graphs
      expect(renderTime).toBeLessThan(500);
    }
  });
});

test.describe('Sibling Nodes - Context Awareness', () => {
  test('should show "Mark Complete" for in-progress tasks', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Navigate to test project
    const projectLink = page.locator('text=/Test Project|Demo Project/i').first();
    if (await projectLink.isVisible()) {
      await projectLink.click();
    }

    await waitForCanvasReady(page);

    // Find and click a task in IN_PROGRESS status
    await clickNodeOnCanvas(page, 'In Progress Task');
    await page.waitForSelector('.sibling-node', { timeout: 5000 });

    // Verify "Mark Complete" action is visible
    const markCompleteAction = page.locator('.sibling-node:has-text("Complete")').first();
    expect(await markCompleteAction.isVisible()).toBe(true);
  });

  test('should show AI scan actions for code files', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Navigate to test project
    const projectLink = page.locator('text=/Test Project|Demo Project/i').first();
    if (await projectLink.isVisible()) {
      await projectLink.click();
    }

    await waitForCanvasReady(page);

    // Click a file node
    await clickNodeOnCanvas(page, 'index.ts');
    await page.waitForSelector('.sibling-node', { timeout: 5000 });

    // Verify AI-related actions are visible
    const aiActions = await page.locator('.sibling-node .ai-badge').count();
    expect(aiActions).toBeGreaterThan(0);
  });
});
