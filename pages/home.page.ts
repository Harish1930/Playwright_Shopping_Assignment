import type { Locator, Page } from '@playwright/test';
import { recoverFromQueue } from '../support/queue-recovery';

export class HomePage {
  readonly signupLoginLink: Locator;
  readonly productsLink: Locator;
  readonly logoutLink: Locator;
  readonly deleteAccountLink: Locator;
  readonly subscriptionHeading: Locator;
  readonly subscriptionEmail: Locator;
  readonly subscriptionSuccessMessage: Locator;
  readonly categoryHeading: Locator;
  readonly brandsHeading: Locator;
  readonly recommendedHeading: Locator;
  readonly heroHeading: Locator;
  readonly featuresItemsHeading: Locator;

  constructor(private readonly page: Page) {
    this.signupLoginLink = page.getByRole('link', { name: 'Signup / Login' });
    this.productsLink = page.getByRole('link', { name: 'Products' });
    this.logoutLink = page.getByRole('link', { name: 'Logout' });
    this.deleteAccountLink = page.getByRole('link', { name: 'Delete Account' });
    this.subscriptionHeading = page.getByRole('heading', { name: 'Subscription' });
    this.categoryHeading = page.getByRole('heading', { name: 'Category', exact: true });
    this.brandsHeading = page.getByRole('heading', { name: 'Brands', exact: true });
    this.recommendedHeading = page.getByRole('heading', { name: 'recommended items' });
    this.heroHeading = page.getByRole('heading', { name: 'Full-Fledged practice website for Automation Engineers' });
    this.featuresItemsHeading = page.getByRole('heading', { name: 'Features Items', exact: true });
    this.subscriptionEmail = page.getByPlaceholder('Your email address');
    this.subscriptionSuccessMessage = page.getByText(
      'You have been successfully subscribed!',
      { exact: true },
    );
  }

  loggedInAs(username: string): Locator {
    return this.page.getByText(`Logged in as ${username}`, { exact: false });
  }

  async open(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    await recoverFromQueue(this.page, '/');
  }

  async openSignupLogin(): Promise<void> {
    await this.signupLoginLink.click();
    await recoverFromQueue(this.page, '/login');
  }

  async openProducts(): Promise<void> {
    await this.productsLink.click();
    await recoverFromQueue(this.page, '/products');
  }

  async openCart(): Promise<void> {
    await this.page.getByRole('link', { name: 'Cart' }).first().click();
    await recoverFromQueue(this.page, '/view_cart');
  }

  async openCategory(group: 'Women' | 'Men', category: 'Tops' | 'Tshirts'): Promise<void> {
    // The category menu's collapse handler is attached by the site's scripts.
    await this.page.waitForLoadState('load');
    await this.page.getByRole('link', { name: new RegExp(`${group}$`) }).click();
    const categoryLink = this.page.getByRole('link', { name: category, exact: true });
    const categoryPath = await categoryLink.getAttribute('href');
    if (!categoryPath) {
      throw new Error(`The ${category} category link has no destination.`);
    }
    await categoryLink.click();
    await recoverFromQueue(this.page, categoryPath);
  }

  async openBrand(brand: string): Promise<void> {
    await this.page.getByRole('link', { name: new RegExp(`${brand}$`, 'i') }).click();
  }

  async addRecommendedProduct(): Promise<string> {
    const item = this.page.locator('.recommended_items .item.active .productinfo').first();
    const name = (await item.locator('p').innerText()).trim();
    await item.getByText('Add to cart').click();
    return name;
  }

  async scrollToTopUsingArrow(): Promise<void> {
    // The site's arrow has no accessible name, so its id is the stable fallback.
    await this.page.locator('#scrollUp').click();
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
    await recoverFromQueue(this.page, '/logout');
  }

  async deleteAccount(): Promise<void> {
    await this.deleteAccountLink.click();
    await recoverFromQueue(this.page, '/delete_account');
  }

  async subscribe(email: string): Promise<void> {
    await this.subscriptionHeading.scrollIntoViewIfNeeded();
    await this.subscriptionEmail.fill(email);
    await this.subscriptionEmail.locator('..').getByRole('button').click();
  }
}
