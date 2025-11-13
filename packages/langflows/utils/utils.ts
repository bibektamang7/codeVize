export const SOURCE_INCLUDE = [
	".ts",
	".tsx",
	".js",
	".jsx",
	".py",
	".go",
	".java",
	".rb",
	".rs",
	".cs",
	".json",
	".md",
	".yml",
	".yaml",
	".toml",
];
export const EXCLUDE_DIRS = new Set([
	"node_modules",
	".git",
	"dist",
	"build",
	".next",
	".cache",
]);

export const checkPathFilter = (path: string): boolean => {
	return true;
};

export const tryInvoke = async <T>(
	fn: () => Promise<T>,
	retries = 3,
	delay = 1000
): Promise<T> => {
	for (let i = 0; i < retries; i++) {
		try {
			return await fn();
		} catch (err) {
			console.log("this is error on suggestion", err);
			if (i < retries - 1)
				await new Promise((res) => setTimeout(res, delay * (i + 1)));
		}
	}
	throw new Error("Max retries reached");
};
