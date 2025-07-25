import React from "react";

const DashboardNavbar = () => {
	return (
		<section>
			<header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#283039] px-10 py-3">
				<div className="flex items-center gap-4 text-white">
					<div className="size-4">
						<svg
							viewBox="0 0 48 48"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<g clip-path="url(#clip0_6_330)">
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
									fill="currentColor"
								></path>
							</g>
							<defs>
								<clipPath id="clip0_6_330">
									<rect
										width="48"
										height="48"
										fill="white"
									></rect>
								</clipPath>
							</defs>
						</svg>
					</div>
					<h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
						Code Reviewer
					</h2>
				</div>
				<div className="flex flex-1 justify-end gap-8">
					<div className="flex items-center gap-9">
						<a
							className="text-white text-sm font-medium leading-normal"
							href="#"
						>
							Dashboard
						</a>
						<a
							className="text-white text-sm font-medium leading-normal"
							href="#"
						>
							Reviews
						</a>
						<a
							className="text-white text-sm font-medium leading-normal"
							href="#"
						>
							Issues
						</a>
						<a
							className="text-white text-sm font-medium leading-normal"
							href="#"
						>
							Settings
						</a>
					</div>

					<div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"></div>
				</div>
			</header>
		</section>
	);
};

const DashboardOverview = () => {
	return (
		<div>
			<h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
				Overview
			</h3>
			<div className="flex flex-wrap gap-4 p-4">
				<div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#3b4754]">
					<p className="text-white text-base font-medium leading-normal">
						Recent Reviews
					</p>
					<p className="text-white tracking-light text-2xl font-bold leading-tight">
						12
					</p>
				</div>
				<div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#3b4754]">
					<p className="text-white text-base font-medium leading-normal">
						Issue Count
					</p>
					<p className="text-white tracking-light text-2xl font-bold leading-tight">
						45
					</p>
				</div>
				<div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#3b4754]">
					<p className="text-white text-base font-medium leading-normal">
						Flagged Issues
					</p>
					<p className="text-white tracking-light text-2xl font-bold leading-tight">
						3
					</p>
				</div>
			</div>
		</div>
	);
};

const DashboardRepos = () => {
	return (
		<div className="flex h-full grow flex-col">
			<div className="flex flex-1 justify-center py-5">
				<div className="layout-content-container flex flex-col max-w-[960px] flex-1">
					<div className="flex flex-wrap justify-between gap-3 p-4">
						<p className="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">
							Repositories
						</p>
						<button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#2c3135] text-white text-sm font-medium leading-normal">
							<span className="truncate">Add Repository</span>
						</button>
					</div>
					<h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
						Usage
					</h3>
					<div className="flex flex-wrap gap-4 p-4">
						<div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#40484f]">
							<p className="text-white text-base font-medium leading-normal">
								Token Used in Last 30 Days
							</p>
							<p className="text-white tracking-light text-2xl font-bold leading-tight">
								1,234
							</p>
						</div>
						<div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#40484f]">
							<p className="text-white text-base font-medium leading-normal">
								Remaining Tokens
							</p>
							<p className="text-white tracking-light text-2xl font-bold leading-tight">
								8,766
							</p>
						</div>
					</div>
					<div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
						<div className="flex flex-col gap-3 pb-3">
							<div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"></div>
							<div>
								<p className="text-white text-base font-medium leading-normal">
									Repository A
								</p>
								<p className="text-[#a2abb3] text-sm font-normal leading-normal">
									Issues Tagged: 2 | Status: Active | Reviews: 5 | Created:
									2023-01-15
								</p>
							</div>
						</div>
						<div className="flex flex-col gap-3 pb-3">
							<div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"></div>
							<div>
								<p className="text-white text-base font-medium leading-normal">
									Repository B
								</p>
								<p className="text-[#a2abb3] text-sm font-normal leading-normal">
									Issues Tagged: 1 | Status: Active | Reviews: 3 | Created:
									2023-02-20
								</p>
							</div>
						</div>
						<div className="flex flex-col gap-3 pb-3">
							<div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"></div>
							<div>
								<p className="text-white text-base font-medium leading-normal">
									Repository C
								</p>
								<p className="text-[#a2abb3] text-sm font-normal leading-normal">
									Issues Tagged: 0 | Status: Inactive | Reviews: 1 | Created:
									2023-03-25
								</p>
							</div>
						</div>
						<div className="flex flex-col gap-3 pb-3">
							<div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"></div>
							<div>
								<p className="text-white text-base font-medium leading-normal">
									Repository D
								</p>
								<p className="text-[#a2abb3] text-sm font-normal leading-normal">
									Issues Tagged: 0 | Status: Inactive | Reviews: 0 | Created:
									2023-04-30
								</p>
							</div>
						</div>
						<div className="flex flex-col gap-3 pb-3">
							<div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"></div>
							<div>
								<p className="text-white text-base font-medium leading-normal">
									Repository E
								</p>
								<p className="text-[#a2abb3] text-sm font-normal leading-normal">
									Issues Tagged: 1 | Status: Active | Reviews: 2 | Created:
									2023-05-05
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			<footer className="flex justify-center">
				<div className="flex max-w-[960px] flex-1 flex-col">
					<footer className="flex flex-col gap-6 px-5 py-10 text-center @container">
						<div className="flex flex-wrap items-center justify-center gap-6 @[480px]:flex-row @[480px]:justify-around">
							<a
								className="text-[#a2abb3] text-base font-normal leading-normal min-w-40"
								href="#"
							>
								Terms of Service
							</a>
							<a
								className="text-[#a2abb3] text-base font-normal leading-normal min-w-40"
								href="#"
							>
								Support
							</a>
						</div>
						<p className="text-[#a2abb3] text-base font-normal leading-normal">
							© 2024 Code Reviewer. All rights reserved.
						</p>
					</footer>
				</div>
			</footer>
		</div>
	);
};

const DashboardPage = () => {
	return (
		<section>
			<div className="relative flex size-full min-h-screen flex-col bg-[#111418] dark group/design-root overflow-x-hidden">
				<div className="layout-container flex h-full grow flex-col">
					<DashboardNavbar />
					<div className="px-40 flex flex-1 justify-center py-5">
						<div className="layout-content-container flex flex-col max-w-[960px] flex-1">
							<div className="flex flex-wrap justify-between gap-3 p-4">
								<p className="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">
									Dashboard
								</p>
							</div>
							<DashboardOverview />

							<DashboardRepos />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default DashboardPage;
