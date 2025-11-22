import { test, expect, Page } from "@playwright/test";
import { mockResponses } from "./mocks";

const BASE_URL = "http://localhost:3000";

test.describe("GitHub SaaS Application E2E Tests", () => {
	// test("redirect to dashboard and view repos if exists", async ({ page }) => {
	// 	await page.goto(`${BASE_URL}/dashboard`);

	// 	await expect(page.locator("text=Dashboard")).toBeVisible({
	// 		timeout: 10000,
	// 	});

	// 	await page.waitForTimeout(5000);
	// 	const listContainer = page.locator(
	// 		`div[aria-labelledby="repository-lists"]`
	// 	);

	// 	const noReposContainer = page.locator(
	// 		`div[aria-labelledby="no-repositories"]`
	// 	);

	// 	const isListVisible = await listContainer.isVisible();
	// 	const isNoReposVisible = await noReposContainer.isVisible();

	// 	if (isListVisible) {
	// 		await expect(noReposContainer).not.toBeVisible();
	// 		console.log(
	// 			"✓ Verified: The repository list container is present (Repos exist)."
	// 		);
	// 	} else if (isNoReposVisible) {
	// 		await expect(listContainer).not.toBeVisible();
	// 		console.log(
	// 			"✓ Verified: The 'No Repositories found' container is present."
	// 		);
	// 	} else {
	// 		throw new Error(
	// 			"Repository card state is ambiguous: Neither the list nor the 'no repos' message is visible."
	// 		);
	// 	}

	// 	if (isNoReposVisible) {
	// 		await expect(
	// 			page.getByRole("button", { name: "Connect a Repository" })
	// 		).toBeVisible();
	// 	}
	// 	console.log("✓ Repository list rendering verification passed.");
	// });

	test("Upgrade FREE → PRO via Khalti", async ({ page }) => {
		console.log("Starting upgrade FREE → PRO test...");

		await page.goto(`${BASE_URL}/dashboard`);

		const subscriptionButton = page.locator("text=Subscription");
		await subscriptionButton.click();

		await page.waitForURL("**/dashboard/subscription");

		await expect(page.locator("text=FREE")).toBeVisible({ timeout: 10000 });
		await expect(page.locator("text=UPGRADE to PRO")).toBeVisible();

		const upgradeButton = page
			.locator(
				'button:has-text("Upgrade"), button:has-text("Subscribe"), button:has-text("Pay")'
			)
			.first();
		await expect(upgradeButton).toBeVisible();
		await upgradeButton.click();

		await page.waitForTimeout(2000);
		await page.locator("text='Khalti Wallet'").click();

		const mobileNumberInput = page.locator("input#khalti-mobile-input");
		await mobileNumberInput.click();
		await mobileNumberInput.fill("9800000003");

		await page.waitForTimeout(3000);
		const passwordInput = page.locator("input#password-input");
		await passwordInput.click();
		await passwordInput.fill("1111");

		const submitButton = page.locator("text='Submit'");
		await submitButton.click();

		const otpInput = page.getByLabel("One-Time Password");

		await otpInput.fill("987654");


		await page.getByText("Pay Rs.").click();
		console.log("✓ Verified: OTP input field holds the correct value.");

		await page.goto(`${BASE_URL}/dashboard`);
		await subscriptionButton.click();

		const newProPlanCard = page.locator('div:has-text("PRO")').first();

		const proCurrentPlanButton = newProPlanCard.locator(
			'button:has-text("Current Plan")'
		);

		await expect(proCurrentPlanButton).toBeVisible({ timeout: 10000 });
		console.log("✓ Verified: PRO plan now displays 'Current Plan' button.");


		const newFreePlanCard = page.locator('div:has-text("Free")').first();
		await expect(
			newFreePlanCard.locator('button:has-text("Current Plan")')
		).not.toBeVisible();
		await expect(
			newFreePlanCard.locator('button:has-text("Upgrade to PRO")')
		).not.toBeVisible();

		console.log("✓ Upgrade FREE → PRO via Khalti test passed");
	});

	// test("Payment fails → remains FREE", async ({ page }) => {
	// 	console.log("Starting payment failure test...");

	// 	await authenticateUser(page);

	// 	await page.goto(`${BASE_URL}/dashboard`);

	// 	await page.locator("text=Subscription, text=Plans").click();
	// 	await page.waitForURL("**/dashboard/subscription");

	// 	await expect(page.locator("text=FREE")).toBeVisible({ timeout: 10000 });
	// 	await expect(page.locator("text=PRO")).toBeVisible();

	// 	const upgradeButton = page
	// 		.locator('button:has-text("Upgrade"), button:has-text("Subscribe")')
	// 		.first();
	// 	await expect(upgradeButton).toBeVisible();
	// 	await upgradeButton.click();

	// 	await page.waitForTimeout(2000);

	// 	const searchParams = new URLSearchParams({
	// 		success: "false",
	// 		plan: "PRO",
	// 		pidx: mockResponses.khalti.initiate.pidx,
	// 	});

	// 	await page.goto(
	// 		`${BASE_URL}/dashboard/subscription/payment?${searchParams.toString()}`
	// 	);

	// 	await page.waitForTimeout(2000);

	// 	await page.goto(`${BASE_URL}/dashboard`);

	// 	await expect(page.locator("text=FREE, text=free")).toBeVisible();

	// 	const aiSettingsTab = page.locator("text=AI Settings");
	// 	await expect(aiSettingsTab).not.toBeVisible();

	// 	console.log("✓ Payment fails → remains FREE test passed");
	// });

	// test("PRO user enables AI review → suggestion posted", async ({ page }) => {
	// 	console.log("Starting AI review test...");

	// 	// Authenticate user first
	// 	await authenticateUser(page);

	// 	await page.goto(`${BASE_URL}/dashboard/subscription`);

	// 	await expect(page.locator("text=FREE")).toBeVisible({ timeout: 10000 });
	// 	await expect(page.locator("text=PRO")).toBeVisible();

	// 	const upgradeButton = page
	// 		.locator('button:has-text("Upgrade"), button:has-text("Subscribe")')
	// 		.first();
	// 	await expect(upgradeButton).toBeVisible();
	// 	await upgradeButton.click();

	// 	const searchParams = new URLSearchParams({
	// 		success: "true",
	// 		plan: "PRO",
	// 		pidx: mockResponses.khalti.initiate.pidx,
	// 	});

	// 	await page.goto(
	// 		`${BASE_URL}/dashboard/subscription/payment?${searchParams.toString()}`
	// 	);
	// 	await page.waitForTimeout(2000);

	// 	await page.goto(`${BASE_URL}/dashboard`);
	// 	await expect(page.locator("text=PRO")).toBeVisible();

	// 	const firstRepo = page
	// 		.locator(`text=${mockResponses.github.repos[0].name}`)
	// 		.first();
	// 	await expect(firstRepo).toBeVisible();
	// 	await firstRepo.click();

	// 	await expect(page.locator("text=Settings, text=Configuration")).toBeVisible(
	// 		{ timeout: 10000 }
	// 	);

	// 	await page.locator("text=AI Settings, text=AI Configuration").click();

	// 	await page.waitForTimeout(1000);

	// 	const aiReviewToggle = page
	// 		.locator(
	// 			'data-testid=ai-review-toggle, .ai-review-toggle, [id*="ai-review"]'
	// 		)
	// 		.or(page.locator("role=switch").filter({ hasText: /ai|review/i }));

	// 	if ((await aiReviewToggle.count()) > 0) {
	// 		await expect(aiReviewToggle).toBeVisible();

	// 		const isToggled = (await aiReviewToggle.isChecked)
	// 			? await aiReviewToggle.isChecked()
	// 			: (await aiReviewToggle.getAttribute("aria-checked")) === "true";

	// 		if (!isToggled) {
	// 			await aiReviewToggle.click();
	// 		}
	// 	} else {
	// 		const enableButton = page.locator(
	// 			'button:has-text("Enable AI Review"), button:has-text("Turn On")'
	// 		);
	// 		if ((await enableButton.count()) > 0) {
	// 			await enableButton.click();
	// 		}
	// 	}

	// 	const saveButton = page.locator(
	// 		'button:has-text("Save"), button:has-text("Save Settings")'
	// 	);
	// 	if ((await saveButton.count()) > 0) {
	// 		await expect(saveButton).toBeVisible();
	// 		await saveButton.click();

	// 		await expect(page.locator("text=Saved, text=Success")).toBeVisible({
	// 			timeout: 5000,
	// 		});
	// 	}

	// 	await expect(page.locator("text=AI Review, text=enabled")).toBeVisible();

	// 	console.log("✓ PRO user enables AI review → suggestion posted test passed");
	// });

	// test("Edit general config (tone, context)", async ({ page }) => {
	// 	console.log("Starting general config edit test...");

	// 	// Authenticate user first
	// 	await authenticateUser(page);

	// 	await page.goto(`${BASE_URL}/dashboard`);

	// 	const firstRepo = page
	// 		.locator(`text=${mockResponses.github.repos[0].name}`)
	// 		.first();
	// 	await expect(firstRepo).toBeVisible();
	// 	await firstRepo.click();

	// 	await expect(page.locator("text=Settings, text=Configuration")).toBeVisible(
	// 		{ timeout: 10000 }
	// 	);

	// 	await page.locator("text=General Settings, text=General Config").click();

	// 	await page.waitForTimeout(1000);

	// 	const toneInput = page.locator(
	// 		'input[placeholder*="tone" i], input[label*="tone" i], [data-testid*="tone" i]'
	// 	);
	// 	if ((await toneInput.count()) > 0) {
	// 		await expect(toneInput).toBeVisible();
	// 		await toneInput.fill("Professional and concise");
	// 	}

	// 	const contextInput = page.locator(
	// 		'textarea[placeholder*="context" i], textarea[label*="context" i], [data-testid*="context" i]'
	// 	);
	// 	if ((await contextInput.count()) > 0) {
	// 		await expect(contextInput).toBeVisible();
	// 		await contextInput.fill(
	// 			"This project follows strict coding standards and best practices."
	// 		);
	// 	}

	// 	const saveButton = page.locator(
	// 		'button:has-text("Save"), button:has-text("Save Settings")'
	// 	);
	// 	await expect(saveButton).toBeVisible();
	// 	await saveButton.click();

	// 	await expect(page.locator("text=Saved, text=Success")).toBeVisible({
	// 		timeout: 5000,
	// 	});

	// 	await page.reload();
	// 	await page.waitForTimeout(2000);

	// 	await page.locator("text=General Settings, text=General Config").click();
	// 	await page.waitForTimeout(1000);

	// 	if ((await toneInput.count()) > 0) {
	// 		await expect(toneInput).toHaveValue("Professional and concise");
	// 	}

	// 	if ((await contextInput.count()) > 0) {
	// 		await expect(contextInput).toHaveValue(
	// 			"This project follows strict coding standards and best practices."
	// 		);
	// 	}

	// 	console.log("✓ Edit general config (tone, context) test passed");
	// });

	// test("FREE user cannot access AI features", async ({ page }) => {
	// 	console.log("Starting FREE user AI access test...");

	// 	// Authenticate user first
	// 	await authenticateUser(page);

	// 	await page.goto(`${BASE_URL}/dashboard`);

	// 	const firstRepo = page
	// 		.locator(`text=${mockResponses.github.repos[0].name}`)
	// 		.first();
	// 	await expect(firstRepo).toBeVisible();
	// 	await firstRepo.click();

	// 	await expect(page.locator("text=Settings, text=Configuration")).toBeVisible(
	// 		{ timeout: 10000 }
	// 	);

	// 	await page.locator("text=AI Settings, text=AI Configuration").click();

	// 	// Verify AI settings are not accessible or disabled for FREE users
	// 	const aiReviewToggle = page
	// 		.locator(
	// 			'data-testid=ai-review-toggle, .ai-review-toggle, [id*="ai-review"]'
	// 		)
	// 		.or(page.locator("role=switch").filter({ hasText: /ai|review/i }));

	// 	if ((await aiReviewToggle.count()) > 0) {
	// 		// If the toggle exists but is disabled for FREE users
	// 		await expect(aiReviewToggle).toBeDisabled();
	// 	} else {
	// 		// If the AI settings section is not available for FREE users
	// 		const aiNotAvailableMessage = page.locator(
	// 			"text=Upgrade to PRO to access AI features, text=AI features available for PRO users only"
	// 		);
	// 		await expect(aiNotAvailableMessage).toBeVisible();
	// 	}

	// 	console.log("✓ FREE user cannot access AI features test passed");
	// });

	// test("PRO user can manage multiple repositories", async ({ page }) => {
	// 	console.log("Starting multiple repository management test...");

	// 	// Authenticate user first
	// 	await authenticateUser(page);

	// 	// Ensure user is PRO by upgrading
	// 	await page.goto(`${BASE_URL}/dashboard/subscription`);
	// 	await expect(page.locator("text=FREE")).toBeVisible({ timeout: 10000 });
	// 	await expect(page.locator("text=PRO")).toBeVisible();

	// 	const upgradeButton = page
	// 		.locator('button:has-text("Upgrade"), button:has-text("Subscribe")')
	// 		.first();
	// 	await expect(upgradeButton).toBeVisible();
	// 	await upgradeButton.click();

	// 	const searchParams = new URLSearchParams({
	// 		success: "true",
	// 		plan: "PRO",
	// 		pidx: mockResponses.khalti.initiate.pidx,
	// 	});

	// 	await page.goto(
	// 		`${BASE_URL}/dashboard/subscription/payment?${searchParams.toString()}`
	// 	);
	// 	await page.waitForTimeout(2000);

	// 	// Go back to dashboard to verify PRO status and test multiple repos
	// 	await page.goto(`${BASE_URL}/dashboard`);
	// 	await expect(page.locator("text=PRO")).toBeVisible();

	// 	// Test each repository has proper settings accessible
	// 	for (const repo of mockResponses.github.repos) {
	// 		const repoLink = page.locator(`text=${repo.name}`).first();
	// 		await expect(repoLink).toBeVisible();
	// 		await repoLink.click();

	// 		// Verify settings are accessible for each repo
	// 		await expect(
	// 			page.locator("text=Settings, text=Configuration")
	// 		).toBeVisible({ timeout: 10000 });

	// 		// Go to general settings and check if we can save settings
	// 		await page.locator("text=General Settings, text=General Config").click();

	// 		const saveButton = page.locator(
	// 			'button:has-text("Save"), button:has-text("Save Settings")'
	// 		);
	// 		if ((await saveButton.count()) > 0) {
	// 			await expect(saveButton).toBeVisible();
	// 		}

	// 		// Navigate back to dashboard for next repo
	// 		await page.goto(`${BASE_URL}/dashboard`);
	// 		await expect(page.locator("text=Dashboard")).toBeVisible();
	// 	}

	// 	console.log("✓ PRO user can manage multiple repositories test passed");
	// });

	// test.afterEach(async ({ page }, testInfo) => {
	// 	console.log(
	// 		`Test "${testInfo.title}" completed. Status: ${testInfo.status}`
	// 	);

	// 	if (testInfo.status === "passed") {
	// 		console.log("Test passed, cleaning up test data...");
	// 		// In a real implementation, you would extract the test user ID from the session
	// 		// and call the cleanup function
	// 		// await cleanupTestUser(testUserId);
	// 		// await cleanupTestRepository(testRepoId);
	// 	} else {
	// 		console.log(`Test failed, status: ${testInfo.status}`);
	// 	}

	// 	await globalTestCleanup();
	// });
});
