import { pullRequestEvent } from "../utils/index.js";
import { sleep } from "k6";

export let options = {
	stages: [
		{ duration: "2s", target: 200 },
		{ duration: "10s", target: 200 },
		{ duration: "5s", target: 0 },
	],
};

export default function () {
	pullRequestEvent();
	sleep(1);
}
