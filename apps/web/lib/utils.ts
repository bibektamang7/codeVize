import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
export async function retryApiCall<T>(
	fn: () => Promise<T>,
	maxRetries: number = 3,
	baseDelay: number = 1000
): Promise<T> {
	let lastError: any;

	for (let i = 0; i <= maxRetries; i++) {
		try {
			return await fn();
		} catch (error: any) {
			lastError = error;

			console.log(error.response.status, "this is login ");
			if (
				error.response &&
				error.response.status >= 400 &&
				error.response.status < 500
			) {
				throw error;
			}

			if (i === maxRetries) {
				throw error;
			}

			const delay =
				Math.min(baseDelay * Math.pow(2, i), 10000) + Math.random() * 1000;
			console.warn(
				`API call failed, retrying in ${delay}ms... (attempt ${i + 1}/${maxRetries + 1})`
			);
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}

	throw lastError;
}

export class CircuitBreaker {
	private failureCount: number = 0;
	private lastFailureTime: number = 0;
	private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
	private readonly failureThreshold: number = 5;
	private readonly timeout: number = 60000; // 1 minute

	async call<T>(fn: () => Promise<T>): Promise<T> {
		const now = Date.now();

		if (this.state === "OPEN" && now - this.lastFailureTime > this.timeout) {
			this.state = "HALF_OPEN";
		}

		if (this.state === "OPEN") {
			throw new Error("Circuit breaker is OPEN");
		}

		try {
			const result = await fn();
			this.failureCount = 0;
			this.state = "CLOSED";
			return result;
		} catch (error) {
			this.failureCount++;
			this.lastFailureTime = now;

			if (this.failureCount >= this.failureThreshold) {
				this.state = "OPEN";
			}

			throw error;
		}
	}
}

export function formatRelativeTime(date: string | Date): string | null {
	const past = new Date(date);
	const now = new Date();

	if (isNaN(past.getTime())) {
		return null;
	}

	
	if (past > now) {
		return null; 
	}

	const diffMs = now.getTime() - past.getTime();
	const diffSeconds = Math.floor(diffMs / 1000);
	const diffMinutes = Math.floor(diffSeconds / 60);
	const diffHours = Math.floor(diffMinutes / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffMinutes < 1) {
		return "Just now";
	} else if (diffMinutes < 60) {
		return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
	} else if (diffHours < 24) {
		return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
	} else if (diffDays < 30) {
		return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
	}
	return past.toLocaleDateString();
}
