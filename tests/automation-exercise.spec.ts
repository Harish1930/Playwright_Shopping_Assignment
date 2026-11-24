import { expect, test } from '../fixtures/page-fixtures';
import type { AuthPage } from '../pages/auth.page';
import type { HomePage } from '../pages/home.page';
import type { RegistrationPage } from '../pages/registration.page';
import type { TestUser } from '../support/test-data';

type AccountPages = {
  homePage: HomePage;
  authPage: AuthPage;
  registrationPage: RegistrationPage;
};

test.describe('Automation Exercise shopping flows', () => {
  async function createPrerequisiteAccount(
    user: TestUser,
    { homePage, authPage, registrationPage }: AccountPages,
  ): Promise<void> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        await homePage.open();
        await homePage.openSignupLogin();

        if (attempt > 1) {
          await authPage.login(user.email, user.password);

          if (await homePage.loggedInAs(user.name).isVisible()) {
            await homePage.logout();
            return;
          }
        }

        await authPage.signup(user.name, user.email);
        await registrationPage.createAccount(user);

        if (!(await registrationPage.accountCreatedHeading.isVisible())) {
          throw new Error('Account creation was interrupted before its confirmation page.');
        }

        await registrationPage.continue();
        await homePage.logout();
        return;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error(`Unable to create prerequisite account for ${user.email}.`);
  }

  async function deleteAccountIfPresent(
    user: TestUser,
    { homePage, authPage }: AccountPages,
  ): Promise<void> {
    try {
      await homePage.open();

      if (await homePage.logoutLink.isVisible()) {
        await homePage.logout();
      }

      await homePage.openSignupLogin();
      await authPage.login(user.email, user.password);

      if (await homePage.loggedInAs(user.name).isVisible({ timeout: 5_000 })) {
        await homePage.deleteAccount();
      }
    } catch {
      // Cleanup is best-effort so it never hides the original test result.
    }
  }

  test.beforeEach(async ({ page, homePage, authPage, registrationPage, users, usersToCleanUp }, testInfo) => {
    await page.route(
      /(?:googlesyndication|doubleclick|googleadservices|adtrafficquality|fundingchoicesmessages)/,
      (route) => route.abort(),
    );

    if (testInfo.tags.includes('@registration')) {
      usersToCleanUp.push(users.registrationUser);
    }
    if (testInfo.tags.includes('@checkout')) {
      usersToCleanUp.push(users.checkoutUser);
    }
    if (testInfo.tags.includes('@login-setup')) {
      usersToCleanUp.push(users.loginUser);
      await createPrerequisiteAccount(users.loginUser, { homePage, authPage, registrationPage });
    }
    if (testInfo.tags.includes('@logout-setup')) {
      usersToCleanUp.push(users.logoutUser);
      await createPrerequisiteAccount(users.logoutUser, { homePage, authPage, registrationPage });
    }

    await homePage.open();
  });

  test.afterEach(async ({ homePage, authPage, registrationPage, usersToCleanUp }) => {
    for (const user of usersToCleanUp) {
      await deleteAccountIfPresent(user, { homePage, authPage, registrationPage });
    }
  });

  test(
    'matches the primary navigation ARIA snapshot',
    { tag: '@aria' },
    async ({ page }) => {
      const primaryNavigation = page
        .getByRole('list')
        .filter({ has: page.getByRole('link', { name: 'Signup / Login' }) });

      await expect.soft(primaryNavigation).toMatchAriaSnapshot(`
        - list:
          - listitem:
            - link " Home":
              - /url: /
          - listitem:
            - link " Products":
              - /url: /products
          - listitem:
            - link " Cart":
              - /url: /view_cart
          - listitem:
            - link " Signup / Login":
              - /url: /login
          - listitem:
            - link " Test Cases":
              - /url: /test_cases
          - listitem:
            - link " API Testing":
              - /url: /api_list
          - listitem:
            - link " Video Tutorials":
              - /url: https://www.youtube.com/c/AutomationExercise
          - listitem:
            - link " Contact us":
              - /url: /contact_us
      `);
    },
  );

  test('Test Case 1: Register User', { tag: ['@functional', '@registration'] }, async ({ homePage, authPage, registrationPage, users }) => {
    await expect.soft(homePage.featuresItemsHeading).toBeVisible();
    await homePage.openSignupLogin();
    await expect.soft(authPage.newUserSignupHeading).toBeVisible();

    await authPage.signup(users.registrationUser.name, users.registrationUser.email);
    await expect.soft(registrationPage.accountInformationHeading).toBeVisible();
    

    await registrationPage.createAccount(users.registrationUser);
    await expect.soft(registrationPage.accountCreatedHeading).toBeVisible();

    await registrationPage.continue();
    await expect.soft(homePage.loggedInAs(users.registrationUser.name)).toBeVisible();

    await homePage.deleteAccount();
    await expect.soft(registrationPage.accountDeletedHeading).toBeVisible();
    await registrationPage.continue();
  });

  test('Test Case 2: Login User with correct email and password', { tag: ['@functional', '@login-setup'] }, async ({ homePage, authPage, registrationPage, users }) => {
    await homePage.open();
    await expect.soft(homePage.featuresItemsHeading).toBeVisible();

    await homePage.openSignupLogin();
    await expect.soft(authPage.loginHeading).toBeVisible();

    await authPage.login(users.loginUser.email, users.loginUser.password);
    await expect.soft(homePage.loggedInAs(users.loginUser.name)).toBeVisible();

    await homePage.deleteAccount();
    await expect.soft(registrationPage.accountDeletedHeading).toBeVisible();
  });

  test('Test Case 3: Logout User', { tag: ['@functional', '@logout-setup'] }, async ({ page, homePage, authPage, users }) => {
    await homePage.open();
    await expect.soft(homePage.featuresItemsHeading).toBeVisible();

    await homePage.openSignupLogin();
    await expect.soft(authPage.loginHeading).toBeVisible();

    await authPage.login(users.logoutUser.email, users.logoutUser.password);
    await expect.soft(homePage.loggedInAs(users.logoutUser.name)).toBeVisible();

    await homePage.logout();
    await expect.soft(page).toHaveURL(/\/login$/);
    await expect.soft(authPage.loginHeading).toBeVisible();
  });

  test('Test Case 4: Verify All Products and product detail page', { tag: '@functional' }, async ({ page, homePage, productsPage, productDetailsPage }) => {
    await homePage.open();
    await expect.soft(homePage.featuresItemsHeading).toBeVisible();

    await homePage.openProducts();
    await expect.soft(productsPage.allProductsHeading).toBeVisible();
    await expect.soft(productsPage.productsList).toBeVisible();

    const product = await productsPage.openFirstProduct();
    await expect.soft(page).toHaveURL(product.path);
    await expect.soft(productDetailsPage.productName).toBeVisible();
    await expect.soft(productDetailsPage.productName).toHaveText(product.name);
    await expect.soft(productDetailsPage.category).toBeVisible();
    await expect.soft(productDetailsPage.category).toHaveText(/^Category:\s*\S.*/);
    await expect.soft(productDetailsPage.price).toBeVisible();
    await expect.soft(productDetailsPage.price).toHaveText(product.price);
    await expect.soft(productDetailsPage.availability).toBeVisible();
    await expect.soft(productDetailsPage.availability).toHaveText(/^Availability:\s*\S.*/);
    await expect.soft(productDetailsPage.condition).toBeVisible();
    await expect.soft(productDetailsPage.condition).toHaveText(/^Condition:\s*\S.*/);
    await expect.soft(productDetailsPage.brand).toBeVisible();
    await expect.soft(productDetailsPage.brand).toHaveText(/^Brand:\s*\S.*/);
  });

  test('Test Case 5: Verify Subscription in home page', { tag: '@functional' }, async ({ homePage, users }) => {
    await homePage.open();
    await expect.soft(homePage.featuresItemsHeading).toBeVisible();

    await homePage.subscriptionHeading.scrollIntoViewIfNeeded();
    await expect.soft(homePage.subscriptionHeading).toBeVisible();

    await homePage.subscribe(users.registrationUser.email);
    await expect.soft(homePage.subscriptionSuccessMessage).toBeVisible();
  });

  test('Test Case 6: Add Products in Cart', { tag: '@functional' }, async ({ page, homePage, productsPage, cartPage }) => {
    await homePage.open();
    await expect.soft(homePage.featuresItemsHeading).toBeVisible();
    await homePage.openProducts();

    const firstProduct = await productsPage.addProductByIndex(0);
    await productsPage.continueShopping();
    const secondProduct = await productsPage.addProductByIndex(1);
    await productsPage.viewCart();

    await expect.soft(page).toHaveURL(/\/view_cart$/);
    await expect.soft(cartPage.productRow(firstProduct.name)).toBeVisible();
    await expect.soft(cartPage.productRow(secondProduct.name)).toBeVisible();
    await expect.soft(cartPage.productPrice(firstProduct.name)).toHaveText(firstProduct.price);
    await expect.soft(cartPage.productQuantity(firstProduct.name)).toHaveText('1');
    await expect.soft(cartPage.productTotal(firstProduct.name)).toHaveText(firstProduct.price);
    await expect.soft(cartPage.productPrice(secondProduct.name)).toHaveText(secondProduct.price);
    await expect.soft(cartPage.productQuantity(secondProduct.name)).toHaveText('1');
    await expect.soft(cartPage.productTotal(secondProduct.name)).toHaveText(secondProduct.price);
  });

  test('Test Case 7: Place Order: Register while Checkout', { tag: ['@functional', '@checkout'] }, async ({ page, homePage, authPage, registrationPage, productsPage, cartPage, checkoutPage, users }) => {
    await homePage.open();
    await expect.soft(homePage.featuresItemsHeading).toBeVisible();
    const product = await productsPage.addProductByIndex(0);
    await productsPage.continueShopping();
    await homePage.openCart();
    await expect.soft(page).toHaveURL(/\/view_cart$/);
    await expect.soft(cartPage.productRow(product.name)).toBeVisible();

    await cartPage.proceedToCheckout();
    await cartPage.registerFromCheckout();
    await authPage.signup(users.checkoutUser.name, users.checkoutUser.email);
    await registrationPage.createAccount(users.checkoutUser);
    await expect.soft(registrationPage.accountCreatedHeading).toBeVisible();
    await registrationPage.continue();
    await expect.soft(homePage.loggedInAs(users.checkoutUser.name)).toBeVisible();

    await homePage.openCart();
    await cartPage.proceedToCheckout();
    await expect.soft(checkoutPage.addressHeading).toBeVisible();
    await expect.soft(checkoutPage.deliveryAddress).toContainText(users.checkoutUser.address1);
    await expect.soft(checkoutPage.billingAddress).toContainText(users.checkoutUser.address1);
    await expect.soft(checkoutPage.reviewHeading).toBeVisible();
    await expect.soft(cartPage.productRow(product.name)).toBeVisible();

    await checkoutPage.placeOrder('Playwright practice order');
    await checkoutPage.payForOrder(users.checkoutUser.name);
    await expect.soft(checkoutPage.orderSuccessMessage).toBeVisible();
    await homePage.deleteAccount();
    await expect.soft(registrationPage.accountDeletedHeading).toBeVisible();
    await registrationPage.continue();
  });

  test('Test Case 8: Remove Products From Cart', { tag: '@functional' }, async ({ page, homePage, productsPage, cartPage }) => {
    await homePage.open();
    await expect.soft(homePage.featuresItemsHeading).toBeVisible();
    const product = await productsPage.addProductByIndex(0);
    await productsPage.continueShopping();
    await homePage.openCart();
    await expect.soft(page).toHaveURL(/\/view_cart$/);
    await expect.soft(cartPage.productRow(product.name)).toBeVisible();
    await cartPage.removeProduct(product.name);
    await expect.soft(cartPage.productRow(product.name)).toHaveCount(0);
    await expect.soft(cartPage.emptyCartMessage).toBeVisible();
  });

  test('Test Case 9: View Category Products', { tag: '@functional' }, async ({ page, homePage }) => {
    await homePage.open();
    await expect.soft(homePage.featuresItemsHeading).toBeVisible();
    await expect.soft(homePage.categoryHeading).toBeVisible();
    await homePage.openCategory('Women', 'Tops');
    await expect.soft(page).toHaveURL(/\/category_products\/2$/);
    await expect.soft(page.getByRole('heading', { name: 'Women - Tops Products' })).toBeVisible();
    await homePage.openCategory('Men', 'Tshirts');
    await expect.soft(page).toHaveURL(/\/category_products\/3$/);
    await expect.soft(page.getByRole('heading', { name: 'Men - Tshirts Products' })).toBeVisible();
  });

  test('Test Case 10: Add to cart from Recommended items', { tag: '@functional' }, async ({ homePage, productsPage, cartPage }) => {
    await homePage.open();
    await expect.soft(homePage.featuresItemsHeading).toBeVisible();
    await homePage.recommendedHeading.scrollIntoViewIfNeeded();
    await expect.soft(homePage.recommendedHeading).toBeVisible();
    const recommendedProduct = await homePage.addRecommendedProduct();
    await productsPage.viewCart();
    await expect.soft(cartPage.productRow(recommendedProduct)).toBeVisible();
    await cartPage.removeProduct(recommendedProduct);
    await expect.soft(cartPage.productRow(recommendedProduct)).toHaveCount(0);
  });

  test("Test Case 11: Verify Scroll Up using 'Arrow' button and Scroll Down functionality", { tag: '@functional' }, async ({ homePage }) => {
    await homePage.open();
    await expect.soft(homePage.featuresItemsHeading).toBeVisible();
    await homePage.subscriptionHeading.scrollIntoViewIfNeeded();
    await expect.soft(homePage.subscriptionHeading).toBeInViewport();
    await homePage.scrollToTopUsingArrow();
    await expect.soft(homePage.heroHeading.first()).toBeInViewport();
  });

  test('Test Case 12: View & Cart Brand Products', { tag: '@functional' }, async ({ page, homePage, productsPage }) => {
    await homePage.open();
    await expect.soft(homePage.featuresItemsHeading).toBeVisible();
    await homePage.openProducts();
    await expect.soft(homePage.brandsHeading).toBeVisible();
    await homePage.openBrand('Polo');
    await expect.soft(page).toHaveURL(/\/brand_products\/Polo$/);
    await expect.soft(page.getByRole('heading', { name: 'Brand - Polo Products' })).toBeVisible();
    await expect.soft(productsPage.viewProductLinks.first()).toBeVisible();
    await homePage.openBrand('H&M');
    await expect.soft(page).toHaveURL(/\/brand_products\/H&M$/);
    await expect.soft(page.getByRole('heading', { name: 'Brand - H&M Products' })).toBeVisible();
    await expect.soft(productsPage.viewProductLinks.first()).toBeVisible();
  });
});
