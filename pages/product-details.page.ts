import type { Locator, Page } from '@playwright/test';

export class ProductDetailsPage {
  readonly productName: Locator;
  readonly category: Locator;
  readonly price: Locator;
  readonly availability: Locator;
  readonly condition: Locator;
  readonly brand: Locator;

  constructor(page: Page) {
    // The product-information container groups the current product's details.
    const information = page.locator('.product-information');
    this.productName = information.getByRole('heading', { level: 2 });
    this.category = information.getByText(/^Category:/);
    this.price = information.getByText(/^Rs\.\s*\d/);
    this.availability = information.locator('p').filter({ hasText: /^Availability:/ });
    this.condition = information.locator('p').filter({ hasText: /^Condition:/ });
    this.brand = information.locator('p').filter({ hasText: /^Brand:/ });
  }
}
