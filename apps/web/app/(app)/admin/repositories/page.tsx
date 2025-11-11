"use client";

import { useState, useEffect } from "react";
import { Search, GitBranch, Trash2, Loader2 } from "lucide-react";
import adminApiService from "@/lib/adminApiService";
import { useSession } from "next-auth/react";
import { RepositoryProps as Repository } from "@/types/model.types";
import { Pagination } from "../payments/page";
import LoaderComponent from "@/components/Loader";

const RepositoriesPage = () => {
	const session = useSession();
	const [repositories, setRepositories] = useState<Repository[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
	const [pagination, setPagination] = useState<Pagination | null>(null);
	const [currentPage, setCurrentPage] = useState(1);

	useEffect(() => {
		fetchRepositories();
	}, [searchTerm, currentPage]);

	const fetchRepositories = async () => {
		try {
			setLoading(true);
			const response = await adminApiService.getAllRepositories(
				session.data?.user?.token!,
				{
					search: searchTerm,
					page: currentPage,
					limit: 10,
				}
			);
			setRepositories(response.data.repositories);
			setPagination(response.data.pagination);
		} catch (err: any) {
			console.error("Error fetching repositories:", err);
			setError(err.response?.data?.message || "Failed to fetch repositories");
		} finally {
			setLoading(false);
		}
	};

	const handleToggleStatus = async (repoId: string) => {
		const repo = repositories.find((r) => r.id === repoId);
		if (!repo) return;

		try {
			await adminApiService.toggleRepositoryStatus(
				repoId,
				!repo.isActive,
				session.data?.user?.token!
			);
			fetchRepositories();
		} catch (err: any) {
			console.error("Error toggling repository status:", err);
			setError(
				err.response?.data?.message || "Failed to toggle repository status"
			);
		}
	};

	const handleDeleteRepository = async (repoId: string) => {
		if (confirm("Are you sure you want to delete this repository?")) {
			try {
				await adminApiService.deleteRepository(
					repoId,
					session.data?.user?.token!
				);
				fetchRepositories();
				if (selectedRepo === repoId) {
					setSelectedRepo(null);
				}
			} catch (err: any) {
				console.error("Error deleting repository:", err);
				setError(err.response?.data?.message || "Failed to delete repository");
			}
		}
	};

	if (loading) {
		return <LoaderComponent />;
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center h-full p-6">
				<div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
					<h3 className="text-lg font-medium text-red-800 mb-2">
						Error Loading Repositories
					</h3>
					<p className="text-red-600 mb-4">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						Repositories Management
					</h1>
					<p className="text-gray-600 mt-1">
						Manage repositories and their configurations
					</p>
				</div>
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
					<input
						type="text"
						placeholder="Search repositories..."
						className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
						value={searchTerm}
						onChange={(e) => {
							setSearchTerm(e.target.value);
							setCurrentPage(1);
						}}
					/>
				</div>
			</div>

			<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Repository
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Owner
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Languages
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Status
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Created
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{repositories.map((repo) => (
								<tr
									key={repo.id}
									className={`hover:bg-gray-50 transition-colors ${selectedRepo === repo.id ? "bg-blue-50" : ""}`}
									onClick={() => setSelectedRepo(repo.id)}
								>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											<div className="shrink-0">
												<GitBranch className="h-5 w-5 text-gray-400" />
											</div>
											<div className="ml-3">
												<div className="text-sm font-medium text-gray-900">
													{repo.repoName}
												</div>
												<div className="text-sm text-gray-500">
													{repo.repoFullName}
												</div>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-900">
											{repo.user.username}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex flex-wrap gap-1">
											{repo.languages.slice(0, 3).map((lang, idx) => (
												<span
													key={idx}
													className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
												>
													{lang}
												</span>
											))}
											{repo.languages.length > 3 && (
												<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
													+{repo.languages.length - 3}
												</span>
											)}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
												repo.isActive
													? "bg-green-100 text-green-800"
													: "bg-red-100 text-red-800"
											}`}
										>
											{repo.isActive ? "Active" : "Inactive"}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{new Date(repo.createdAt).toLocaleDateString()}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<div className="flex items-center justify-end space-x-3">
											<button
												onClick={(e) => {
													e.stopPropagation();
													handleDeleteRepository(repo.id);
												}}
												className="text-red-600 hover:text-red-700"
											>
												<Trash2 className="h-4 w-4" />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{repositories.length === 0 && (
					<div className="text-center py-10">
						<p className="text-gray-500">No repositories found</p>
					</div>
				)}
			</div>

			{pagination && (
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<p className="text-sm text-gray-700">
						Showing{" "}
						<span className="font-medium">
							{Math.min(
								(pagination.page - 1) * pagination.limit + 1,
								pagination.total
							)}
						</span>{" "}
						to{" "}
						<span className="font-medium">
							{Math.min(pagination.page * pagination.limit, pagination.total)}
						</span>{" "}
						of <span className="font-medium">{pagination.total}</span> results
					</p>
					<div className="flex space-x-2">
						<button
							className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
							onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
							disabled={currentPage === 1}
						>
							Previous
						</button>
						<button
							className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 ${currentPage === pagination.pages ? "opacity-50 cursor-not-allowed" : ""}`}
							onClick={() =>
								setCurrentPage((prev) => Math.min(prev + 1, pagination.pages))
							}
							disabled={currentPage === pagination.pages}
						>
							Next
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default RepositoriesPage;
