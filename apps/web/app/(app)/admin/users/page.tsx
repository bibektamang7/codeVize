"use client";
import { useState, useEffect } from "react";
import { Search, Trash2, Loader2 } from "lucide-react";
import adminApiService from "@/lib/adminApiService";
import { useSession } from "next-auth/react";
import { Pagination } from "../payments/page";
import LoaderComponent from "@/components/Loader";
import Image from "next/image";

interface User {
	id: string;
	githubId: string;
	username: string;
	email: string;
	image: string;
	activeRepos: number;
	planName: string;
	createdAt: string;
}

const UsersPage = () => {
	const session = useSession();
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedUser, setSelectedUser] = useState<string | null>(null);
	const [pagination, setPagination] = useState<Pagination | null>(null);
	const [currentPage, setCurrentPage] = useState(1);

	useEffect(() => {
		fetchUsers();
	}, [searchTerm, currentPage]);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const response = await adminApiService.getAllUsers(
				session.data?.user?.token!,
				{
					search: searchTerm,
					page: currentPage,
					limit: 10,
				}
			);
			setUsers(response.users);
			setPagination(response.pagination);
		} catch (err: any) {
			console.error("Error fetching users:", err);
			setError(err.response?.data?.message || "Failed to fetch users");
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteUser = async (userId: string) => {
		if (confirm("Are you sure you want to delete this user?")) {
			try {
				await adminApiService.deleteUser(userId, session.data?.user?.token!);
				fetchUsers();
				if (selectedUser === userId) {
					setSelectedUser(null);
				}
			} catch (err: any) {
				console.error("Error deleting user:", err);
				setError(err.response?.data?.message || "Failed to delete user");
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
						Error Loading Users
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
					<h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
					<p className="text-gray-600 mt-1">
						Manage user accounts and their settings
					</p>
				</div>
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
					<input
						type="text"
						placeholder="Search users..."
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
									User
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Repos
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Plan
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Joined Date
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
							{users.map((user) => (
								<tr
									key={user.id}
									className={`hover:bg-gray-50 transition-colors ${selectedUser === user.id ? "bg-blue-50" : ""}`}
									onClick={() => setSelectedUser(user.id)}
								>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											<div className="shrink-0 h-10 w-10">
												<Image
													className="h-10 w-10 rounded-full"
													src={user.image}
													alt=""
													width={10}
													height={10}
													loading="lazy"
												/>
											</div>
											<div className="ml-4">
												<div className="text-sm font-medium text-gray-900">
													{user.username}
												</div>
												<div className="text-sm text-gray-500">
													{user.email}
												</div>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-900">
											{user.activeRepos}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
												user.planName === "FREE"
													? "bg-gray-100 text-gray-800"
													: user.planName === "PRO"
														? "bg-blue-100 text-blue-800"
														: "bg-purple-100 text-purple-800"
											}`}
										>
											{user.planName}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{new Date(user.createdAt).toLocaleDateString()}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<button
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteUser(user.id);
											}}
											className="text-red-600 hover:text-red-700 flex items-center justify-end w-full"
										>
											<Trash2 className="h-4 w-4 mr-1" />
											<span>Delete</span>
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{users.length === 0 && (
					<div className="text-center py-10">
						<p className="text-gray-500">No users found</p>
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

export default UsersPage;
