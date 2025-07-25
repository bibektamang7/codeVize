"use client";

export default function Home() {
	const handleConnectGithubApp = () => {
		const url = process.env.NEXT_PUBLIC_GITHUB_APP_URL;
		window.location.href = `${url}/new?state=${"123"}`;
	};
	return (
		<div className="w-full h-screen gap-5 flex justify-center items-center flex-col">
			<h3>Connect to github app</h3>
			<button
				className="bg-blue-500 px-2 py-2 rounded-md hover:cursor-pointer"
				onClick={handleConnectGithubApp}
			>
				Click here to connect
			</button>
		</div>
	);
}
