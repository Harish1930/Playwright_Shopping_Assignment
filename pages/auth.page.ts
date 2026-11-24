import type { Locator, Page } from '@playwright/test';
import { runWithQueueRecovery } from '../support/queue-recovery';

export class AuthPage {
  readonly newUserSignupHeading: Locator;
  readonly loginHeading: Locator;
  readonly signupName: Locator;
  readonly signupEmail: Locator;
  readonly loginEmail: Locator;
  readonly loginPassword: Locator;

  constructor(private readonly page: Page) {
    this.newUserSignupHeading = page.getByRole('heading', { name: 'New User Signup!' });
    this.loginHeading = page.getByRole('heading', { name: 'Login to your account' });
    this.signupName = page.getByTestId('signup-name');
    this.signupEmail = page.getByTestId('signup-email');
    this.loginEmail = page.getByTestId('login-email');
    this.loginPassword = page.getByTestId('login-password');
  }

  async signup(name: string, email: string): Promise<void> {
    await runWithQueueRecovery(this.page, async () => {
      await this.signupName.fill(name);
      await this.signupEmail.fill(email);
      await this.page.getByTestId('signup-button').click();
    }, '/login');
  }

  async login(email: string, password: string): Promise<void> {
    await runWithQueueRecovery(this.page, async () => {
      if (await this.page.getByRole('link', { name: 'Logout' }).isVisible()) {
        return;
      }

      await this.loginEmail.fill(email);
      await this.loginPassword.fill(password);
      await this.page.getByTestId('login-button').click();
    }, '/login');
  }
}
