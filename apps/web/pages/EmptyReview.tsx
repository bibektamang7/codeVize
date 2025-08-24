import { GitPullRequest } from "lucide-react";
import React from "react";

const EmptyReview = () => {
	return (
		<div className="h-screen flex items-center justify-center text-gray-300">
			<div className="flex flex-col items-center text-center p-8 rounded-2xl ">
				<div className="p-6 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)]">
					<GitPullRequest className="w-16 h-16 text-gray-400" />
				</div>
				<h1 className="text-xl font-semibold mt-6">No Pull Requests Yet</h1>
				<p className="text-gray-500 mt-2 max-w-sm">
					It looks like there aren’t any pull requests in this repository. Once
					you or your team open one, it will be listed here.
				</p>
			</div>
		</div>
	);
};

export default EmptyReview;
