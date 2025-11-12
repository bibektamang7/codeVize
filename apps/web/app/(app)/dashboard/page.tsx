"use client";
import { Suspense, lazy } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import LoaderComponent from "@/components/Loader";
const RepositoryLists = lazy(() => import("@/components/RepositoryLists"));

const DashboardPage = () => {
	const handleConnectGithubApp = () => {
		const url = process.env.NEXT_PUBLIC_GITHUB_APP_URL;
		window.location.href = `${url}/new?state=123`;
	};

	return (
		<main className="container mx-auto px-4 py-6 max-w-6xl">
			<header className="mb-6">
				<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl md:text-3xl font-bold">
							Your Repositories
						</h1>
						<p className="text-muted-foreground mt-1">
							Manage and configure your connected repositories
						</p>
					</div>
					<Button
						onClick={handleConnectGithubApp}
						className="hover:cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white"
						aria-label="Add Repository"
					>
						<Plus className="mr-2 h-4 w-4" /> Add Repository
					</Button>
				</div>
			</header>

			<Suspense
				fallback={
					<div className="flex justify-center py-12">
						<LoaderComponent />
					</div>
				}
			>
				<RepositoryLists />
			</Suspense>
		</main>
	);
};

export default DashboardPage;
