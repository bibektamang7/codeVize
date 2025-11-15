import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";

export default function CodevizeLanding() {
	return (
		<div className="min-h-screen bg-black p-8 text-white flex items-center justify-center">
			<div className="w-full max-w-[1300px] rounded-[28px] bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.04)] overflow-hidden shadow-2xl">
				<Navbar />
				<section className="px-12 pb-10 relative">
					<div
						className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-[420px] h-[300px] pointer-events-none"
						style={{ filter: "blur(48px)" }}
					>
						<div className="w-full h-full rounded-full bg-linear-to-b from-indigo-400 to-transparent opacity-30" />
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

							<h1 className="max-w-[980px] font-semibold text-[56px] md:text-[64px] lg:text-[74px] leading-[1.1] tracking-tight text-gray-200">
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
								<Button>Book a Demo</Button>

								<Button className="rounded-full bg-white text-black px-6 py-3 font-medium shadow-[0_8px_24px_rgba(99,102,241,0.2)]">
									Analyze Now
								</Button>
							</div>
						</div>
					</div>

					<div className="mt-12 px-2">
						<div className="rounded-[26px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.03)] p-6 -translate-y-6">
							<div className="grid grid-cols-12 gap-6 items-center">
								<div className="col-span-4 bg-[rgba(255,255,255,0.01)] rounded-lg p-4">
									<div className="h-20 rounded-md bg-linear-to-br from-[rgba(255,255,255,0.02)] to-transparent p-3">
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

				<div className="px-8 pb-10">
					<div className="mt-6 rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-6 border border-[rgba(255,255,255,0.03)]">
						<div className="grid grid-cols-3 gap-6">
							<div className="col-span-1 bg-[rgba(255,255,255,0.015)] rounded-lg p-4">
								<div className="h-32 rounded-lg bg-linear-to-br from-[#0b1010] to-transparent p-3">
									<div className="flex items-center justify-between">
										<div className="relative flex items-center gap-3">
											<div className="w-12 h-12 rounded-full bg-white/6 flex items-center justify-center">
												🔖
											</div>
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

			<div className="pointer-events-none fixed inset-0 -z-10">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#0d1420,transparent_35%)] opacity-40" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#182c3a,transparent_25%)] mix-blend-overlay opacity-30" />
			</div>
		</div>
	);
}
