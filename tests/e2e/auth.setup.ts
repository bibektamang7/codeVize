import { test as setup } from "@playwright/test";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const authFile = path.join(__dirname, "..", "playwright", ".auth", "user.json");
console.log("SETUP SAVE PATH:", authFile);

const BASE_URL = process.env.BASE_URL!;
const GITHUB_EMAIL = process.env.GITHUB_EMAIL!;
const GITHUB_PASSWORD = process.env.GITHUB_PASSWORD!;

setup("authenticate and save session", async ({ page }) => {
	console.log("--- Running Authentication Setup ---");

	await page.goto(`${BASE_URL}/signup`);
	await page.click(
		'button:has-text("Sign up with GitHub"), button:text("Continue with GitHub")'
	);

	await page.waitForSelector("#login_field", { timeout: 15000 });
	await page.fill("#login_field", GITHUB_EMAIL);
	await page.fill("#password", GITHUB_PASSWORD);
	await page.click('input[name="commit"]');

	await page.waitForURL(`${BASE_URL}/dashboard`);

	await page.context().storageState({ path: authFile });
	console.log(`✅ Saved authenticated state to ${authFile}`);
});
