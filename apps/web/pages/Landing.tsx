// import Navbar from "@/components/Navbar";
// import React from "react";

// const LandingPage = () => {
// 	return (
// 		<div className="bg-black text-white h-screen px-4 py-2 md:px-40 py-4">
// 			<Navbar />
// 		</div>
// 	);
// };

// export default LandingPage;

import { Button } from "@/components/ui/button";
import React from "react";

export default function CodevizeLanding() {
	return (
		<div className="min-h-screen bg-black p-8 text-white flex items-center justify-center">
			{/* Container */}
			<div className="w-full max-w-[1300px] rounded-[28px] bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.04)] overflow-hidden shadow-2xl">
				{/* Top bar */}
				<header className="flex items-center justify-between px-8 py-6">
					<div className="flex items-center gap-4">
						{/* <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-md"></div> */}
						<span className="font-semibold">Codevize</span>
					</div>

					<nav className="flex items-center gap-6">
						<ul className="hidden md:flex items-center gap-6 bg-[rgba(255,255,255,0.02)] px-4 py-2 rounded-full">
							<li className="px-4 py-1 rounded-full bg-white text-black font-medium">
								Home
							</li>
							<li className="opacity-70">Features</li>
							<li className="opacity-70">Teams</li>
							<li className="opacity-70">Docs</li>
							<li className="opacity-70">Pricing</li>
						</ul>
					</nav>

					<div className="hidden md:flex items-center gap-3">
						<Button className="text-sm opacity-80 bg-inherit">Login</Button>
						<Button className="px-4 py-1 rounded-full bg-inherit  border border-[rgba(255,255,255,0.12)] text-sm">
							Sign Up
						</Button>
					</div>
				</header>

				{/* Hero section */}
				<section className="px-12 pb-10 relative">
					<div
						className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-[420px] h-[300px] pointer-events-none"
						style={{ filter: "blur(48px)" }}
					>
						<div className="w-full h-full rounded-full bg-gradient-to-b from-indigo-400 to-transparent opacity-30" />
					</div>

					<div className="pt-6">
						<div className="flex flex-col items-center text-center">
							<div className="inline-flex items-center gap-3 bg-[rgba(255,255,255,0.03)] px-4 py-2 rounded-full mb-6">
								<span className="text-xs opacity-80">
									⚡ AI-Powered GitHub PR Review & Issue Tagging
								</span>
								<button className="bg-indigo-500 text-black px-2 py-1 rounded-full text-xs">
									Try
								</button>
							</div>

							<h1 className="max-w-[980px] text-[56px] md:text-[72px] lg:text-[86px] leading-[0.98] font-extralight tracking-tight">
								Smarter Code Reviews,
								<br />
								Faster Issue Tagging
							</h1>

							<p className="mt-6 text-sm opacity-70 max-w-[760px]">
								Codevize helps you track GitHub PRs, suggest improvements,
								<br />
								and automatically tag issues with AI-driven accuracy.
							</p>

							<div className="mt-8 flex items-center gap-4">
								<div className="rounded-full bg-[rgba(255,255,255,0.02)] px-6 py-3 flex items-center gap-4 border border-[rgba(255,255,255,0.04)]">
									<svg
										className="opacity-80"
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
									>
										<path
											d="M3 12h18"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
										/>
									</svg>
									<input
										className="bg-transparent outline-none text-sm w-[420px] placeholder:opacity-60"
										placeholder="Enter GitHub Repo URL"
									/>
								</div>
								<button className="rounded-full bg-white text-black px-6 py-3 font-medium shadow-[0_8px_24px_rgba(99,102,241,0.2)]">
									Analyze Now
								</button>
							</div>
						</div>
					</div>

					{/* Stats and panels */}
					<div className="mt-12 px-2 bg-[rgba(255,255,255,0.02)] rounded-[26px] border border-[rgba(255,255,255,0.04)]">
						<div className="rounded-[26px]  bg-[rgba(0,0,0,0.05)] border border-[rgba(255,255,255,0.03)] p-6 -translate-y-6">
							<div className="grid grid-cols-12 gap-6 items-center">
								<div className="col-span-4 bg-[rgba(255,255,255,0.01)] rounded-lg p-4">
									<div className="h-20 rounded-md bg-gradient-to-br from-[rgba(255,255,255,0.02)] to-transparent p-3">
										<div className="flex items-center gap-2 text-xs">
											<span className="px-2 py-1 rounded-full bg-indigo-600/20">
												Linked
											</span>
											<span className="px-2 py-1 rounded bg-white/5">
												Pull Request #42
											</span>
										</div>
										<div className="mt-3 text-[10px] opacity-60">
											REVIEW READY
										</div>
									</div>
								</div>

								<div className="col-span-4 flex flex-col items-center gap-3">
									<div className="text-4xl font-light">92%</div>
									<div className="text-xs opacity-70">Improvement Accuracy</div>
									<div className="text-[11px] opacity-60 max-w-[220px] text-center">
										AI suggestions improve pull request quality and streamline
										code collaboration.
									</div>
								</div>

								<div className="col-span-4">
									<div className="h-28 rounded-md bg-[rgba(255,255,255,0.01)] flex items-center justify-center">
										<div className="flex items-center gap-4">
											<div className="w-12 h-12 rounded-full bg-indigo-400/20 flex items-center justify-center">
												GH
											</div>
											<div className="w-12 h-12 rounded-full bg-white/6 flex items-center justify-center">
												API
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Bottom panel */}
				<div className="px-8 pb-10">
					<div className="mt-6 rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-6 border border-[rgba(255,255,255,0.03)]">
						<div className="grid grid-cols-3 gap-6">
							<div className="col-span-1 bg-[rgba(255,255,255,0.015)] rounded-lg p-4">
								<div className="h-32 rounded-lg bg-gradient-to-br from-[#0b1010] to-transparent p-3">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="w-8 h-8 rounded-md bg-white/6" />
											<div className="text-xs opacity-70">PR Insights</div>
										</div>
										<div className="text-xs opacity-60">...</div>
									</div>
								</div>
							</div>

							<div className="col-span-1 bg-[rgba(255,255,255,0.015)] rounded-lg p-4 flex items-center justify-center">
								<div className="text-center">
									<div className="text-3xl font-light">Tag AI</div>
									<div className="text-[11px] opacity-60">
										Auto-label issues with precision
									</div>
								</div>
							</div>

							<div className="col-span-1 bg-[rgba(255,255,255,0.015)] rounded-lg p-4">
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 rounded-full bg-white/6 flex items-center justify-center">
										🤝
									</div>
									<div>
										<div className="text-sm font-medium">Collaborate</div>
										<div className="text-xs opacity-60">GitHub, Slack, API</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* vignette */}
			<div className="pointer-events-none fixed inset-0 -z-10">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#0d1420,transparent_35%)] opacity-40" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#182c3a,transparent_25%)] mix-blend-overlay opacity-30" />
			</div>
		</div>
	);
}
