import type { Page } from '@playwright/test';

const maxAttempts = 6;

async function isQueueFull(page: Page): Promise<boolean> {
  return page.getByRole('heading', { name: /website is under heavy load/i }).isVisible();
}

/** Retry a navigation only when the site has returned its queue-full page. */
export async function recoverFromQueue(page: Page, path: string): Promise<void> {
  for (let attempt = 1; attempt < maxAttempts; attempt += 1) {
    if (!(await isQueueFull(page))) {
      return;
    }

    await page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  if (await isQueueFull(page)) {
    throw new Error(`Automation Exercise remained on its queue-full page after ${maxAttempts} attempts.`);
  }
}

/** Retry an action after returning to a known page when the queue is full. */
export async function runWithQueueRecovery(
  page: Page,
  action: () => Promise<void>,
  recoveryPath: string,
): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    await recoverFromQueue(page, recoveryPath);
    await action();

    if (!(await isQueueFull(page))) {
      return;
    }
  }

  throw new Error(`Automation Exercise remained on its queue-full page after ${maxAttempts} attempts.`);
}

/** Report an uncertain submission without automatically submitting it again. */
export async function throwIfQueueFull(page: Page, message: string): Promise<void> {
  if (await isQueueFull(page)) {
    throw new Error(message);
  }
}
