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

			// Don't retry on client errors (4xx), only server errors (5xx) or network issues
			if (
				error.response &&
				error.response.status >= 400 &&
				error.response.status < 500
			) {
				throw error;
			}

			// If we've exhausted retries, throw the last error
			if (i === maxRetries) {
				throw error;
			}

			// Exponential backoff with jitter
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

// Simple circuit breaker implementation
export class CircuitBreaker {
	private failureCount: number = 0;
	private lastFailureTime: number = 0;
	private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
	private readonly failureThreshold: number = 5;
	private readonly timeout: number = 60000; // 1 minute

	async call<T>(fn: () => Promise<T>): Promise<T> {
		const now = Date.now();

		// Check if circuit breaker has timed out
		if (this.state === "OPEN" && now - this.lastFailureTime > this.timeout) {
			this.state = "HALF_OPEN";
		}

		// If circuit is open, throw an error
		if (this.state === "OPEN") {
			throw new Error("Circuit breaker is OPEN");
		}

		try {
			const result = await fn();
			// Success - reset failure count
			this.failureCount = 0;
			this.state = "CLOSED";
			return result;
		} catch (error) {
			// Failure - increment failure count
			this.failureCount++;
			this.lastFailureTime = now;

			// If failure count exceeds threshold, open circuit
			if (this.failureCount >= this.failureThreshold) {
				this.state = "OPEN";
			}

			throw error;
		}
	}
}