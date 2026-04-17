import { test as base } from '@playwright/test';
import { ReportPage } from '../page-objects/ReportPage';
import { NavigationPage } from '../page-objects/NavigationPage';

export type ReportFixtures = {
  reportPage: ReportPage;
  navigationPage: NavigationPage;
};

export const test = base.extend<ReportFixtures>({
  reportPage: async ({ page }, use) => {
    const reportPage = new ReportPage(page);
    await use(reportPage);
  },

  navigationPage: async ({ page }, use) => {
    const navigationPage = new NavigationPage(page);
    await use(navigationPage);
  },
});

export { expect } from '@playwright/test';
