import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

/**
 * Use process.env.PORT by default and fallback to port 3000.
 */
const PORT = process.env.PORT || 3000;

/**
 * Set webServer.url and use.baseURL with the location of the web server
 * respecting the correct port.
 */
const baseURL = process.env.BASE_URL ?? `http://localhost:${PORT}`;

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	/**
	 * Fail the build on CI if you accidentally left test.only in the source code.
	 */
	forbidOnly: Boolean(process.env.CI),

	/**
	 * Run tests in files in parallel.
	 */
	fullyParallel: true,

	/**
	 * Configure projects for major browsers.
	 */
	projects: [
		/**
		 * Desktop browsers.
		 */
		{
			name: 'Desktop Chrome',
			use: {
				...devices['Desktop Chrome'],
			},
		},
		{
			name: 'Desktop Firefox',
			use: {
				...devices['Desktop Firefox'],
			},
		},
		{
			name: 'Desktop Firefox',
			use: {
				...devices['Desktop Safari'],
			},
		},

		/**
		 * Mobile browsers.
		 */
		{
			name: 'Mobile Chrome',
			use: {
				...devices['Pixel 5'],
			},
		},
		{
			name: 'Mobile Safari',
			use: {
				...devices['iPhone 12'],
			},
		},
	],

	/**
	 * Reporter to use.
	 * @see https://playwright.dev/docs/test-reporters
	 */
	reporter: 'html',

	/**
	 * Retry on CI only.
	 */
	retries: process.env.CI ? 2 : 0,
	testDir: './e2e',

	/**
	 * Shared settings for all the projects below.
	 * @see https://playwright.dev/docs/api/class-testoptions.
	 */
	use: {
		/**
		 * Base URL to use in actions like `await page.goto('/')`.
		 */
		baseURL,

		/**
		 * Collect trace when retrying the failed test.
		 * @see https://playwright.dev/docs/trace-viewer
		 */
		trace: 'on-first-retry',
	},

	/**
	 * Run your local dev server before starting the tests
	 */
	webServer: process.env.BASE_URL
		? undefined
		: {
				command: 'pnpm -w dev:web',
				reuseExistingServer: true,
				url: baseURL,
			},

	/**
	 * Opt out of parallel tests on CI.
	 */
	workers: process.env.CI ? 1 : undefined,
});
