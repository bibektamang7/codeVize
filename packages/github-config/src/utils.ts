export function chooseMode(files: any[], tokenLimit: number = 5000) {
	let totalTokens = 0;
	for (const f of files) {
		if (f.patch) {
			totalTokens += Math.ceil(f.patch.length / 4);
		}
	}

	if (files.length <= 3 && totalTokens < tokenLimit) {
		return "full-pr"; // small enough → single prompt
	} else {
		return "per-file"; // large PR → chunk per file
	}
}
