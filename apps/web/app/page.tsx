// "use client";

// export default function Home() {
// 	const handleConnectGithubApp = () => {
// 		const url = process.env.NEXT_PUBLIC_GITHUB_APP_URL;
// 		window.location.href = `${url}/new?state=${"123"}`;
// 	};
// 	return (
// 		<div className="bg-black w-full h-screen gap-5 flex justify-center items-center flex-col">
// 			<h3 className="text-white">Connect to github app</h3>
// 			<button
// 				className="bg-white px-2 py-2 rounded-md hover:cursor-pointer"
// 				onClick={handleConnectGithubApp}
// 			>
// 				Click here to connect
// 			</button>
// 		</div>
// 	);
// }

import Landing from "@/pages/Landing";
import React from "react";

const Home = () => {
	return (
		<div className="">
			<Landing />
		</div>
	);
};

export default Home;
