import { AlertCircle } from "lucide-react";
import React from "react";

const EmptyIssue = () => {
	return (
		<div className="min-h-screen flex items-center justify-center text-gray-300">
			<div className="flex flex-col items-center text-center p-8 rounded-2xl ">
				<div className="p-6 rounded-full  shadow-[0_0_20px_rgba(255,255,255,0.1)]">
					<AlertCircle className="w-16 h-16 text-gray-400" />
				</div>
				<h1 className="text-xl font-semibold mt-6">No Issues Found</h1>
				<p className="text-gray-500 mt-2 max-w-sm">
					You don’t have any issues logged yet. Create one to track bugs,
					feature requests, or tasks.
				</p>
			</div>
		</div>
	);
};

export default EmptyIssue;
