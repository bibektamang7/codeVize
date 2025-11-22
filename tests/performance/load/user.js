import http from "k6/http";
import { sleep, check } from "k6";

export let options = {
	stages: [
		{ duration: "10s", target: 10 },
		{ duration: "1m", target: 10 },
		{ duration: "30s", target: 0 },
	],
};

export function setup() {
	const githubId = __ENV.USER_GITHUB_ID;
	console.log("this is id", githubId);
	const email = __ENV.USER_EMAIL;
	const payload = JSON.stringify({
		githubId,
		email,
	});

	const res = http.post(`${__ENV.URL}/users/login`, payload, {
		headers: { "Content-Type": "application/json" },
	});
	const body = JSON.parse(res.body);
	const token = body.token;
	return { token };
}

export default function getRepositoryByIdTest(data) {
	const token = data.token;
	const repoId = __ENV.REPO_ID;
	const res = http.get(`${__ENV.URL}/repositories/repository/${repoId}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	console.log("this is status", res.status);

	check(res, {
		"status is 200": (r) => r.status === 200,
	});

	sleep(1);
}
