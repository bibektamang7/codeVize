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
