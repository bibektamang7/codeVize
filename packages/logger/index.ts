export const logger = {
	info: (msg: string, data?: unknown) => console.log("[INFO]", msg, data ?? ""),
	warn: (msg: string, data?: unknown) =>
		console.warn("[WARN]", msg, data ?? ""),
	error: (msg: string, error?: unknown) =>
		console.error("[ERROR]", msg, error instanceof Error ? error.stack : error),
};
