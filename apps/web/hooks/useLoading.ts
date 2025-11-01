import { useState, useCallback } from "react";
import { toast } from "sonner";

export function useLoading<T extends (...args: any[]) => Promise<any>>(
	fn: T,
	successMessage: string,
	errorMessage: string
) {
	const [loading, setLoading] = useState(false);

	const wrappedFn = useCallback(
		async (...args: Parameters<T>) => {
			setLoading(true);
			try {
				const result = await fn(...args);
				if (!result) return;
				if (result.status === 200) {
					toast.success(successMessage);
				}
			} catch (err) {
				toast.error(errorMessage);
			} finally {
				setLoading(false);
			}
		},
		[fn]
	);

	return { loading, run: wrappedFn };
}
