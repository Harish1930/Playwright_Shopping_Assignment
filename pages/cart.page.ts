import type { Locator, Page } from '@playwright/test';

export class CartPage {
  readonly emptyCartMessage: Locator;

  constructor(private readonly page: Page) {
    this.emptyCartMessage = page.getByText('Cart is empty!');
  }

  async removeProduct(productName: string): Promise<void> {
    const row = this.productRow(productName);

    // The site's cart script attaches the remove handler as the page loads.
    await this.page.waitForLoadState('load');
    // The remove control has no href or accessible name on the site.
    await row.locator('.cart_quantity_delete').click();
    await row.waitFor({ state: 'hidden' });
  }

  async proceedToCheckout(): Promise<void> {
    await this.page.waitForLoadState('load');
    await this.page.getByText('Proceed To Checkout', { exact: true }).click();
  }

  async registerFromCheckout(): Promise<void> {
    await this.page.getByRole('link', { name: 'Register / Login' }).click();
  }

  productRow(productName: string): Locator {
    return this.page
      .getByRole('row')
      .filter({ has: this.page.getByRole('link', { name: productName, exact: true }) });
  }

  productPrice(productName: string): Locator {
    return this.productRow(productName).getByRole('cell').nth(2);
  }

  productQuantity(productName: string): Locator {
    return this.productRow(productName).getByRole('cell').nth(3);
  }

  productTotal(productName: string): Locator {
    return this.productRow(productName).getByRole('cell').nth(4);
  }
}
