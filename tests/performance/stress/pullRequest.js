import { sleep } from "k6";
import { pullRequestEvent } from "../utils/index.js";

export const options = {
	stages: [
		{ duration: "1m", target: 20 },
		{ duration: "1m", target: 50 },
		{ duration: "1m", target: 100 },
		{ duration: "1m", target: 150 },
		{ duration: "30s", target: 0 },
	],
};

export default function () {
	pullRequestEvent();
	sleep(1);
}
