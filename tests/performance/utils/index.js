import http from "k6/http";
import crypto from "k6/crypto";
import { check } from "k6";

export function generateSignature(secret, body) {
	const hmac = crypto.hmac("sha256", secret, body, "hex");
	return `sha256=${hmac}`;
}

export function generateUUID() {
	const bytes = crypto.randomBytes(16);
	const hex = Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	return hex;
}

export function pullRequestEvent() {
	const url = __ENV.URL + "/githubs/webhook";

	const secret = __ENV.GITHUB_WEBHOOK_SECRET;
	const deliveryId = generateUUID();

	const payload = JSON.stringify({
		action: "opened",
		number: Math.floor(Math.random() * 1000),
		repository: {
			id: "603420324",
			name: "Competitive-Programming",
			owner: { login: "my-org" },
		},
		installation: { id: 999 },
		pull_request: {
			number: 42,
			title: "Add new feature",
			head: { sha: "abc123" },
			base: { sha: "def456" },
		},
	});

	const signature = generateSignature(secret, payload);
	const params = {
		headers: {
			"Content-Type": "application/json",
			"X-Hub-Signature-256": signature,
			"X-Github-Event": "pull_request",
			"X-GitHub-Delivery": deliveryId,
			"User-Agent": "GitHub-Hookshot/test",
		},
	};

	const res = http.post(url, payload, params);

	check(res, {
		"status is 200": (r) => r.status === 200,
	});
}
