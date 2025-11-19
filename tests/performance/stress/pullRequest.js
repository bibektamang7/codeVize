import http from "k6/http";
import { check, sleep } from "k6";
import { generateSignature } from "../load/pullRequest";
import { generateUUID } from "../load/pullRequest";

export let options = {
	stages: [
		{ duration: "1m", target: 20 },
		{ duration: "1m", target: 50 },
		{ duration: "1m", target: 100 },
		{ duration: "1m", target: 150 },
		{ duration: "30s", target: 0 },
	],
};

export default function () {
	const url = "http://localhost:4000/api/v1/githubs/webhook";
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

	const secret = __ENV.GITHUB_WEBHOOK_SECRET;
	const deliveryId = generateUUID();

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

	sleep(1);
}
