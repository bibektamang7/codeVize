import { useLoading } from "@/hooks/useLoading";
import { repositoryAPI } from "@/lib/api";
import { RepositoryProps } from "@/types/model.types";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import LoaderComponent from "./Loader";
import {
	GitBranch,
	MoreHorizontal,
	Play,
	Plus,
	Search,
	Settings,
	ShieldX,
} from "lucide-react";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "./ui/alert-dialog";

const RepositoryLists = () => {
	const session = useSession();
	const [search, setSearch] = useState("");
	const [repos, setRepos] = useState<RepositoryProps[]>([]);
	const [loading, setLoading] = useState(true);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogType, setDialogType] = useState<"activate" | null>(null);
	const [selectedRepo, setSelectedRepo] = useState<RepositoryProps | null>(
		null
	);

	const toggleRepositoryActivationCall = useLoading(
		(repoId: string, isActive: boolean) =>
			isActive
				? repositoryAPI.deactivateRepository(repoId, session.data?.user?.token!)
				: repositoryAPI.activateRepository(repoId, session.data?.user?.token!),
		"Repository status updated successfully!",
		"Failed to update repository status"
	);

	const fetchRepositories = async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/repositories/`,
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${session.data?.user?.token}`,
					},
					next: {
						revalidate: 60 * 3,
					},
				}
			);
			const result = await response.json();
			setRepos(result.repositories || []);
		} catch (error) {
			toast.error("Something went wrong, please try again.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (session.status === "authenticated") {
			alert("called");
			fetchRepositories();
		}
	}, [session.status]);

	const handleToggleActivation = async (repo: RepositoryProps) => {
		if (!repo.id) return;
		await toggleRepositoryActivationCall.run(repo.id, repo.isActive);
		setRepos((prev) =>
			prev.map((prevRepo) =>
				prevRepo.id === repo.id
					? { ...prevRepo, isActive: !repo.isActive }
					: prevRepo
			)
		);
		setDialogOpen(false);
		setSelectedRepo(null);
	};

	const openDialog = (type: "activate", repo: RepositoryProps) => {
		setDialogType(type);
		setSelectedRepo(repo);
		setDialogOpen(true);
	};

	const closeDialog = () => {
		setDialogOpen(false);
		setSelectedRepo(null);
	};

	const filteredRepos = repos.filter((r) =>
		r.repoName.toLowerCase().includes(search.toLowerCase())
	);

	if (loading || !session || !session.data) {
		return (
			<div className="flex justify-center py-12">
				<LoaderComponent />
			</div>
		);
	}

	return (
		<>
			<div className="mb-6 flex items-center gap-2 max-w-md w-full">
				<div className="relative flex-1">
					<Search
						className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
						aria-hidden="true"
					/>
					<Input
						placeholder="Search repositories..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						aria-label="Search repositories"
						className="pl-10 py-2 w-full rounded-lg border"
					/>
				</div>
			</div>

			<Card
				className="bg-card border-border shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl"
				role="region"
				aria-labelledby="repositories-heading"
			>
				<h2
					id="repositories-heading"
					className="sr-only"
				>
					Repositories List
				</h2>
				<CardContent className="p-0">
					{filteredRepos.length > 0 ? (
						<div className="divide-y divide-border">
							{filteredRepos.map((repo) => (
								<div
									key={repo.id}
									className="flex items-center justify-between w-full p-4"
								>
									<Link
										href={`/dashboard/repo/${repo.id}`}
										className="flex-1 block transition-colors hover:bg-accent hover:text-accent-foreground duration-200 rounded-lg p-2 -m-2"
										aria-label={`Navigate to ${repo.repoName} settings`}
									>
										<div
											role="listitem"
											className="flex items-center gap-3"
										>
											<GitBranch
												className="h-5 w-5 text-muted-foreground"
												aria-hidden="true"
											/>
											<span className="font-semibold truncate max-w-xs md:max-w-md">
												{repo.repoName}
											</span>
										</div>
									</Link>
									<div className="pl-4 flex items-center gap-2 text-sm text-muted-foreground">
										<span
											className={`h-3 w-3 rounded-full ${repo.isActive ? "bg-green-500" : "bg-gray-400"}`}
											aria-label={
												repo.isActive
													? "Active repository"
													: "Inactive repository"
											}
											title={repo.isActive ? "Active" : "Inactive"}
										></span>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="sm"
													aria-label={`Options for ${repo.repoName}`}
												>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent
												align="end"
												className="dark"
											>
												<Link href={`/dashboard/repo/${repo.id}`}>
													<DropdownMenuItem>
														<Settings className="mr-2 h-4 w-4" /> Settings
													</DropdownMenuItem>
												</Link>
												<DropdownMenuItem
													onClick={() => openDialog("activate", repo)}
												>
													<Play className="mr-2 h-4 w-4" />
													{repo.isActive
														? "Deactivate Repository"
														: "Activate Repository"}
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>
							))}
						</div>
					) : (
						<div
							role="alert"
							className="py-16 text-center flex flex-col items-center justify-center gap-4"
						>
							<div className="flex flex-col items-center justify-center gap-3 p-6 max-w-md mx-auto">
								<ShieldX
									className="h-12 w-12 text-muted-foreground"
									aria-hidden="true"
								/>
								<h3 className="text-xl font-semibold">No repositories found</h3>
								<p className="text-muted-foreground text-center">
									{search
										? "No repositories match your search."
										: "You haven't connected any repositories yet."}
								</p>
								{!search && (
									<Button
										onClick={() => {
											const url = process.env.NEXT_PUBLIC_GITHUB_APP_URL;
											window.location.href = `${url}/new?state=123`;
										}}
										variant="outline"
										className="mt-4 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white"
									>
										<Plus className="mr-2 h-4 w-4" /> Connect a Repository
									</Button>
								)}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<AlertDialog
				open={dialogOpen && dialogType === "activate"}
				onOpenChange={setDialogOpen}
			>
				<AlertDialogContent className="dark">
					<AlertDialogHeader>
						<AlertDialogTitle>
							Confirm Repository Status Change
						</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to{" "}
							{selectedRepo?.isActive ? "deactivate " : "activate "}
							the repository "<strong>{selectedRepo?.repoName}</strong>"?
							{selectedRepo?.isActive
								? " This will stop all AI analysis."
								: " This will start AI analysis."}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={closeDialog}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => handleToggleActivation(selectedRepo!)}
							disabled={toggleRepositoryActivationCall.loading}
						>
							{toggleRepositoryActivationCall.loading ? (
								<LoaderComponent />
							) : selectedRepo?.isActive ? (
								"Deactivate"
							) : (
								"Activate"
							)}{" "}
							Repository
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};

export default RepositoryLists;
