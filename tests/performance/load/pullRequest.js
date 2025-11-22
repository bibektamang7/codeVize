import { sleep } from "k6";
import { pullRequestEvent } from "../utils/index.js";

export let options = {
	stages: [
		{ duration: "10s", target: 10 },
		{ duration: "1m", target: 10 },
		{ duration: "30s", target: 0 },
	],
};

export default function () {
	pullRequestEvent();
	sleep(1);
}
