export type Title = 'Mr' | 'Mrs';

export interface TestUser {
  title: Title;
  name: string;
  email: string;
  password: string;
  birthDay: string;
  birthMonth: string;
  birthMonthNumber: string;
  birthYear: string;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
}

export interface SuiteUsers {
  registrationUser: TestUser;
  loginUser: TestUser;
  logoutUser: TestUser;
  checkoutUser: TestUser;
}

function createUser(role: string, uniqueRunId: string): TestUser {
  const capitalizedRole = `${role.charAt(0).toUpperCase()}${role.slice(1)}`;

  return {
    title: 'Mr',
    name: `${capitalizedRole} User ${uniqueRunId.slice(-5)}`,
    email: `pw-${role}-${uniqueRunId}@example.com`,
    password: 'Playwright@123',
    birthDay: '15',
    birthMonth: 'May',
    birthMonthNumber: '5',
    birthYear: '1990',
    firstName: capitalizedRole,
    lastName: 'Tester',
    company: 'Playwright Labs',
    address1: '42 Test Automation Road',
    address2: 'Quality District',
    country: 'India',
    state: 'Kerala',
    city: 'Kochi',
    zipcode: '682001',
    mobileNumber: '9876543210',
  };
}

export function createSuiteUsers(): SuiteUsers {
  const uniqueRunId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    registrationUser: createUser('register', uniqueRunId),
    loginUser: createUser('login', uniqueRunId),
    logoutUser: createUser('logout', uniqueRunId),
    checkoutUser: createUser('checkout', uniqueRunId),
  };
}
