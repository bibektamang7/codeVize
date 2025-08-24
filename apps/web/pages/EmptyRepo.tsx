import { FolderX } from "lucide-react";

export default function EmptyRepoPage() {
	return (
		<div className="w-full h-full flex items-center justify-center text-gray-300">
			<div className="flex flex-col items-center text-center p-8 rounded-2xl]">
				<div className="p-6 rounded-full bg-gray-800 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
					<FolderX className="w-16 h-16 text-gray-400" />
				</div>
				<h1 className="text-xl font-semibold mt-6">No Repositories Found</h1>
				<p className="text-gray-500 mt-2 max-w-sm">
					You haven’t added any repositories yet. Once you connect a repo, it
					will appear here for analysis and review.
				</p>
				<button className="mt-6 px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition">
					Add Repository
				</button>
			</div>
		</div>
	);
}
