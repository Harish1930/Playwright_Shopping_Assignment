import type { Locator, Page } from '@playwright/test';
import { recoverFromQueue } from '../support/queue-recovery';

export interface ProductSummary {
  name: string;
  price: string;
}

export interface ProductDetailsLink extends ProductSummary {
  path: string;
}

export class ProductsPage {
  readonly allProductsHeading: Locator;
  readonly productsList: Locator;
  readonly viewProductLinks: Locator;
  readonly continueShoppingButton: Locator;
  readonly viewCartLink: Locator;

  constructor(private readonly page: Page) {
    this.allProductsHeading = page.getByRole('heading', { name: 'All Products' });
    this.viewProductLinks = page.getByRole('link', { name: 'View Product' });
    // The site does not expose a named list role for the product grid.
    this.productsList = page.locator('.features_items').filter({ has: this.viewProductLinks });
    this.continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });
    this.viewCartLink = page.getByRole('link', { name: 'View Cart' });
  }

  private productCard(index: number): Locator {
    // Product cards do not have an accessible list role on the site.
    return this.page.locator('.features_items .product-image-wrapper').nth(index);
  }

  async productAt(index: number): Promise<ProductSummary> {
    const info = this.productCard(index).locator('.productinfo');
    const name = (await info.locator('p').innerText()).trim();
    const price = (await info.getByRole('heading').innerText()).trim();
    return { name, price };
  }

  async openFirstProduct(): Promise<ProductDetailsLink> {
    const product = await this.productAt(0);
    const link = this.viewProductLinks.first();
    const path = await link.getAttribute('href');
    if (!path) {
      throw new Error('The first product does not have a product detail link.');
    }

    await link.click();
    await recoverFromQueue(this.page, path);
    return { ...product, path };
  }

  async addProductByIndex(index: number): Promise<ProductSummary> {
    const product = await this.productAt(index);
    const productCard = this.productCard(index);

    await productCard.scrollIntoViewIfNeeded();
    await productCard.hover();
    await productCard.locator('.product-overlay').getByText('Add to cart').click();
    return product;
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  async viewCart(): Promise<void> {
    await this.viewCartLink.click();
    await recoverFromQueue(this.page, '/view_cart');
  }
}
