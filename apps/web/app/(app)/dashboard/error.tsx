"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="w-full flex items-center justify-center flex-col gap-4">
			<h2 className="text-xl text-red-500">Something went wrong!</h2>
			<Button
				onClick={() => reset()}
				className="hover:cursor-pointer"
			>
				Try again
			</Button>
		</div>
	);
}
