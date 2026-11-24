import type { Locator, Page } from '@playwright/test';
import type { TestUser } from '../support/test-data';
import { recoverFromQueue, throwIfQueueFull } from '../support/queue-recovery';

export class RegistrationPage {
  readonly accountInformationHeading: Locator;
  readonly name: Locator;
  readonly email: Locator;
  readonly accountCreatedHeading: Locator;
  readonly accountDeletedHeading: Locator;

  constructor(private readonly page: Page) {
    this.accountInformationHeading = page.getByRole('heading', {
      name: 'Enter Account Information',
    });
    this.name = page.getByTestId('name');
    this.email = page.getByTestId('email');
    this.accountCreatedHeading = page.getByTestId('account-created');
    this.accountDeletedHeading = page.getByTestId('account-deleted');
  }

  async fillAccountInformation(user: TestUser): Promise<void> {
    await this.page.getByRole('radio', { name: `${user.title}.` }).check();
    await this.page.getByTestId('password').fill(user.password);
    await this.page.getByTestId('days').selectOption(user.birthDay);
    await this.page.getByTestId('months').selectOption({ label: user.birthMonth });
    await this.page.getByTestId('years').selectOption(user.birthYear);
    await this.page
      .getByRole('checkbox', { name: 'Sign up for our newsletter!' })
      .check();
    await this.page
      .getByRole('checkbox', { name: 'Receive special offers from our partners!' })
      .check();
  }

  async fillAddressInformation(user: TestUser): Promise<void> {
    await this.page.getByTestId('first_name').fill(user.firstName);
    await this.page.getByTestId('last_name').fill(user.lastName);
    await this.page.getByTestId('company').fill(user.company);
    await this.page.getByTestId('address').fill(user.address1);
    await this.page.getByTestId('address2').fill(user.address2);
    await this.page.getByTestId('country').selectOption({ label: user.country });
    await this.page.getByTestId('state').fill(user.state);
    await this.page.getByTestId('city').fill(user.city);
    await this.page.getByTestId('zipcode').fill(user.zipcode);
    await this.page.getByTestId('mobile_number').fill(user.mobileNumber);
  }

  async createAccount(user: TestUser): Promise<void> {
    await this.fillAccountInformation(user);
    await this.fillAddressInformation(user);
    await this.page.getByTestId('create-account').click();

    await throwIfQueueFull(
      this.page,
      'Automation Exercise reported a full queue after account submission. ' +
        'The account may or may not have been created; retry when the site is available.',
    );
  }

  async continue(): Promise<void> {
    await this.page.getByTestId('continue-button').click();

    await recoverFromQueue(this.page, '/');
  }
}
