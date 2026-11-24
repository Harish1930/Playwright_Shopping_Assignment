import type { Locator, Page } from '@playwright/test';

export class CheckoutPage {
  readonly addressHeading: Locator;
  readonly deliveryAddress: Locator;
  readonly billingAddress: Locator;
  readonly reviewHeading: Locator;
  readonly orderPlacedHeading: Locator;
  readonly orderSuccessMessage: Locator;

  constructor(private readonly page: Page) {
    this.addressHeading = page.getByRole('heading', { name: 'Address Details' });
    this.deliveryAddress = page.locator('#address_delivery');
    this.billingAddress = page.locator('#address_invoice');
    this.reviewHeading = page.getByRole('heading', { name: 'Review Your Order' });
    this.orderPlacedHeading = page.getByTestId('order-placed');
    this.orderSuccessMessage = page.getByText('Congratulations! Your order has been confirmed!');
  }

  async placeOrder(comment: string): Promise<void> {
    await this.page.locator('textarea[name="message"]').fill(comment);
    await this.page.getByRole('link', { name: 'Place Order' }).click();
  }

  async payForOrder(name: string): Promise<void> {
    await this.page.getByTestId('name-on-card').fill(name);
    await this.page.getByTestId('card-number').fill('4111111111111111');
    await this.page.getByTestId('cvc').fill('123');
    await this.page.getByTestId('expiry-month').fill('12');
    await this.page.getByTestId('expiry-year').fill('2030');
    await this.page.getByTestId('pay-button').click();
  }
}
