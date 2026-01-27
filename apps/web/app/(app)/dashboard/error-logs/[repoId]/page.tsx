"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	AlertTriangle,
	GitBranch,
	Calendar,
	Clock,
	ArrowLeft,
	Loader2,
} from "lucide-react";
import { RepositoryProps, RepoErrorLogProps } from "@/types/model.types";

interface ErrorLogsDetailPageProps {
	params: {
		repoId: string;
	};
}

const ErrorLogsDetailPage = ({ params }: ErrorLogsDetailPageProps) => {
	const [repo, setRepo] = useState<RepositoryProps | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchRepoData = async () => {
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_BACKEND_URL}/repositories/${params.repoId}/logs`,
				);

				if (!response.ok) {
					if (response.status === 401) {
						// Redirect to login if unauthorized
						window.location.href = "/login";
						return;
					}
					throw new Error(
						`Failed to fetch repository data: ${response.status} ${response.statusText}`,
					);
				}

				const data = await response.json();
				setRepo(data.repo);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "An unknown error occurred",
				);
			} finally {
				setLoading(false);
			}
		};

		fetchRepoData();
	}, [params.repoId]);

	if (loading) {
		return (
			<div className="container mx-auto py-8 px-4">
				<div className="mb-6">
					<Link
						href="/dashboard/error-logs"
						className="inline-flex items-center"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						<span>Back to Error Logs</span>
					</Link>
				</div>
				<div className="animate-pulse space-y-4">
					<div className="h-8 bg-gray-200 rounded w-1/3"></div>
					<div className="h-4 bg-gray-200 rounded w-1/2"></div>
					{[...Array(3)].map((_, i) => (
						<div
							key={i}
							className="border rounded-lg p-4 bg-card"
						>
							<div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
							<div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
							<div className="h-3 bg-gray-200 rounded w-1/2"></div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto py-8 px-4">
				<div className="mb-6">
					<Link
						href="/dashboard/error-logs"
						className="inline-flex items-center"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						<span>Back to Error Logs</span>
					</Link>
				</div>
				<Card>
					<CardContent className="py-12 text-center">
						<AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-xl font-semibold">Error Loading Data</h3>
						<p className="text-muted-foreground mt-2">{error}</p>
						<Link
							href="/dashboard/error-logs"
							className="mt-4 inline-block"
						>
							<Button variant="outline">Go Back</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!repo || !repo.repoConfig?.errorLogs) {
		return (
			<div className="container mx-auto py-8 px-4">
				<div className="mb-6">
					<Link
						href="/dashboard/error-logs"
						className="inline-flex items-center"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						<span>Back to Error Logs</span>
					</Link>
				</div>

				<Card>
					<CardContent className="py-12 text-center">
						<AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-xl font-semibold">No Error Logs Found</h3>
						<p className="text-muted-foreground mt-2">
							This repository has no error logs.
						</p>
						<Link
							href="/dashboard/error-logs"
							className="mt-4 inline-block"
						>
							<Button variant="outline">Go Back</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	const errorLogs = repo.repoConfig.errorLogs;

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="mb-6">
				<Link
					href="/dashboard/error-logs"
					className="inline-flex items-center"
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					<span>Back to Error Logs</span>
				</Link>
			</div>

			<div className="mb-8">
				<div className="flex items-center gap-2 mb-2">
					<GitBranch className="h-5 w-5 text-muted-foreground" />
					<h1 className="text-2xl sm:text-3xl font-bold">{repo.repoName}</h1>
				</div>
				<p className="text-muted-foreground">
					Showing {errorLogs.length} error{errorLogs.length !== 1 ? "s" : ""}{" "}
					for this repository
				</p>
			</div>

			<div className="space-y-4">
				{errorLogs.map((errorLog: RepoErrorLogProps, index: number) => (
					<Card
						key={`${repo.id}-${index}`}
						className="hover:shadow-md transition-shadow"
					>
						<CardHeader className="pb-3">
							<div className="flex justify-between items-start">
								<CardTitle className="flex items-center gap-2">
									<AlertTriangle className="h-4 w-4 text-destructive" />
									<span className="capitalize">{errorLog.type}</span>
								</CardTitle>
								<Badge
									variant={errorLog.resolved ? "secondary" : "destructive"}
								>
									{errorLog.resolved ? "Resolved" : "Active"}
								</Badge>
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-sm mb-3">{errorLog.message}</p>

							<div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
								<div className="flex items-center">
									<Calendar className="h-3 w-3 mr-1" />
									<span>
										{new Date(errorLog.occurredAt).toLocaleDateString()}
									</span>
								</div>
								<div className="flex items-center">
									<Clock className="h-3 w-3 mr-1" />
									<span>
										{new Date(errorLog.occurredAt).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</div>
								{errorLog.number !== undefined && (
									<div className="flex items-center">
										<span>#{errorLog.number}</span>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
};

export default ErrorLogsDetailPage;
