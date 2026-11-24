import { test as base, expect } from '@playwright/test';
import { AuthPage } from '../pages/auth.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { HomePage } from '../pages/home.page';
import { ProductDetailsPage } from '../pages/product-details.page';
import { ProductsPage } from '../pages/products.page';
import { RegistrationPage } from '../pages/registration.page';
import { createSuiteUsers, type SuiteUsers, type TestUser } from '../support/test-data';

type PageFixtures = {
  homePage: HomePage;
  authPage: AuthPage;
  registrationPage: RegistrationPage;
  productsPage: ProductsPage;
  productDetailsPage: ProductDetailsPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  users: SuiteUsers;
  usersToCleanUp: TestUser[];
};

export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  },
  registrationPage: async ({ page }, use) => {
    await use(new RegistrationPage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  productDetailsPage: async ({ page }, use) => {
    await use(new ProductDetailsPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  users: async ({}, use) => {
    await use(createSuiteUsers());
  },
  usersToCleanUp: async ({}, use) => {
    await use([]);
  },
});

export { expect };
