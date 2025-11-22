import http from "k6/http";
import { sleep, check } from "k6";

export let options = {
	stages: [
		{ duration: "1m", target: 20 },
		{ duration: "1m", target: 50 },
		{ duration: "1m", target: 100 },
		{ duration: "1m", target: 150 },
		{ duration: "30s", target: 0 },
	],
};

export default function signupTest() {
	const randomId = Math.random().toFixed(5);
	const randomDigit = randomId.split(".")[1];
	const payload = JSON.stringify({
		githubId: randomDigit,
		email: `test-${randomId}@gmail.com`,
		username: `test-${randomId}`,
		image: `this is just testing so we will not put actula  image`,
	});
	const res = http.post(`${__ENV.URL}/users/register`, payload, {
		headers: {
			"Content-Type": "application/json",
		},
	});

	check(res, {
		"status is 200": (r) => r.status === 200,
	});
	sleep(1);
}
