"use client";
import { Button } from "@/components/ui/button";
import { FolderX } from "lucide-react";

export default function EmptyRepoPage() {
	const handleAddRepository = () => {
		const url = process.env.NEXT_PUBLIC_GITHUB_APP_URL;
		window.location.href = `${url}/new`;
	};
	return (
		<div className="w-full h-full flex items-center justify-center text-gray-300">
			<div className="flex flex-col items-center text-center p-8 rounded-2xl]">
				<div className="p-6 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)]">
					<FolderX className="w-16 h-16 text-gray-400" />
				</div>
				<h1 className="text-xl font-semibold mt-6">No Repositories Found</h1>
				<p className="text-gray-500 mt-2 max-w-sm">
					You haven’t added any repositories yet. Once you connect a repo, it
					will appear here for analysis and review.
				</p>
				<Button
					onClick={handleAddRepository}
					className="hover:cursor-pointer mt-6 px-6 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-500 text-white shadow-lg transition"
				>
					Add Repository
				</Button>
			</div>
		</div>
	);
}
