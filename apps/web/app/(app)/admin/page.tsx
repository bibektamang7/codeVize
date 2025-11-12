"use client";

import { act, useEffect, useState } from "react";
import { BarChart3, GitBranch, Users, CreditCard, Loader2 } from "lucide-react";
import adminApiService from "@/lib/adminApiService";
import { useSession } from "next-auth/react";
import { Activity, Stats } from "@/types/model.types";
import { formatRelativeTime } from "@/lib/utils";
import LoaderComponent from "@/components/Loader";

const DashboardPage = () => {
	const session = useSession();
	const [stats, setStats] = useState<Stats | null>(null);
	const [activity, setActivity] = useState<Activity | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchDashboardStats = async () => {
			try {
				setLoading(true);
				const response = await adminApiService.getDashboardStats(
					session.data?.user?.token!
				);
				console.log(response, "this i in dadmin")
				setActivity(response.activity);
				setStats(response.stats);
			} catch (err: any) {
				console.error("Error fetching dashboard stats:", err);
				setError(
					err.response?.data?.message || "Failed to fetch dashboard statistics"
				);
			} finally {
				setLoading(false);
			}
		};

		fetchDashboardStats();
	}, []);

	const statCards = stats
		? [
				{
					title: "Total Tokens Used",
					value: stats.totalTokensUsed.toLocaleString(),
					icon: <BarChart3 className="h-6 w-6" />,
					color: "text-blue-500",
				},
				{
					title: "Active Repositories",
					value: stats.activeRepositories,
					icon: <GitBranch className="h-6 w-6" />,
					color: "text-green-500",
				},
				{
					title: "Total Users",
					value: stats.totalUsers,
					icon: <Users className="h-6 w-6" />,
					color: "text-purple-500",
				},
				{
					title: "Total Payments",
					value: stats.totalPayments,
					icon: <CreditCard className="h-6 w-6" />,
					color: "text-orange-500",
				},
			]
		: [];

	if (loading) {
		return <LoaderComponent />;
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center h-full p-6">
				<div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
					<h3 className="text-lg font-medium text-red-800 mb-2">
						Error Loading Dashboard
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
		<div className="space-y-6 w-full">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
					<p className="text-gray-600 mt-1">
						Welcome back! Here's what's happening today.
					</p>
				</div>
				<div className="text-sm text-gray-500 bg-gray-100 rounded-lg px-3 py-2">
					Last updated: Today, {new Date().toLocaleTimeString()}
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
				{statCards.map((stat, index) => (
					<div
						key={index}
						className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
					>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-500">
									{stat.title}
								</p>
								<p className="text-2xl font-bold text-gray-900 mt-1">
									{stat.value}
								</p>
							</div>
							<div className={`p-3 rounded-lg bg-gray-100 ${stat.color}`}>
								{stat.icon}
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Recent Activity
					</h2>
					<div className="space-y-4">
						<div className="flex items-center">
							<div className="shrink-0">
								<div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5 text-green-600"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
							</div>
							{activity && activity.newUser ? (
								<div className="ml-4">
									<h3 className="text-sm font-medium text-gray-900">
										New user registered
									</h3>
									<p className="text-sm text-gray-500">
										{activity.newUser.username} signed{" "}
										{formatRelativeTime(activity.newUser.createdAt)}
									</p>
								</div>
							) : (
								<p className="ml-4 text-gray-400 text-sm">
									No recent user registrations
								</p>
							)}
						</div>
						<div className="flex items-center">
							<div className="shrink-0">
								<div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5 text-blue-600"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
							</div>
							{activity && activity.newRepositoryAdded ? (
								<div className="ml-4">
									<h3 className="text-sm font-medium text-gray-900">
										New repository added
									</h3>
									<p className="text-sm text-gray-500">
										{activity.newRepositoryAdded.user.username} added{" "}
										{activity.newRepositoryAdded.repoName}{" "}
										{formatRelativeTime(
											activity.newRepositoryAdded.createdAt
										)}{" "}
									</p>
								</div>
							) : (
								<p className="ml-4 text-gray-400 text-sm">
									No recent repository added.
								</p>
							)}
						</div>
						<div className="flex items-center">
							<div className="shrink-0">
								<div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5 text-purple-600"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
							</div>
							{activity && activity.paymentReceived ? (
								<div className="ml-4">
									<h3 className="text-sm font-medium text-gray-900">
										Payment received
									</h3>
									<p className="text-sm text-gray-500">
										New payment of RS. {activity.paymentReceived.amount}{" "}
										processed {activity.paymentReceived?.createdAt.toString()}{" "}
										ago
									</p>
								</div>
							) : (
								<p className="ml-4 text-gray-400 text-sm">
									No payment received yet.
								</p>
							)}
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Quick Overview
					</h2>
					<div className="space-y-4">
						<div className="flex justify-between items-center pb-2 border-b border-gray-100">
							<span className="text-gray-600">System Status</span>
							<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
								Operational
							</span>
						</div>
						<div className="flex justify-between items-center pb-2 border-b border-gray-100">
							<span className="text-gray-600">Pending Payments</span>
							<span className="text-gray-900 font-medium">
								{activity && activity.pendingPaymentsCount}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DashboardPage;
