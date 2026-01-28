"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, GitBranch, Calendar, Clock } from "lucide-react";
import { RepositoryProps } from "@/types/model.types";

const ErrorLogsClient = ({ repos }: { repos: RepositoryProps[] }) => {
	return (
		<div className="container mx-auto py-6 px-4 sm:py-8">
			<div className="mb-6 sm:mb-8">
				<h1 className="text-2xl sm:text-3xl font-bold">Error Logs</h1>
				<p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
					View error logs from your repositories
				</p>
			</div>

			{repos.length === 0 ? (
				<Card>
					<CardContent className="py-10 sm:py-12 text-center">
						<AlertTriangle className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
						<h3 className="text-lg sm:text-xl font-semibold">
							No Error Logs Found
						</h3>
						<p className="text-muted-foreground mt-2">
							There are no repositories with error logs at this time.
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="flex flex-wrap gap-4">
					{repos.map((repo: RepositoryProps) => {
						const lastError = repo.repoConfig?.errorLogs[0];
						return (
							<Link
								key={repo.id}
								href={`/dashboard/error-logs/${repo.id}`}
								className="block grow shrink-0 basis-80"
							>
								<Card className="hover:shadow-md transition-shadow h-full cursor-pointer">
									<CardHeader className="pb-3">
										<div className="flex justify-between items-start flex-wrap gap-x-2 gap-y-1">
											<CardTitle className="flex items-center gap-2 flex-1 min-w-0">
												<GitBranch className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
												<span className="truncate text-sm sm:text-base">
													{repo.repoName}
												</span>
											</CardTitle>
											<Badge
												variant="destructive"
												className="ml-2 shrink-0 text-xs sm:text-sm"
											>
												Error
											</Badge>
										</div>
									</CardHeader>
									<CardContent>
										<div className="text-sm text-muted-foreground mb-3 min-h-10">
											{lastError ? (
												<div className="truncate">
													<span className="font-medium">Last error:</span>{" "}
													{lastError.message.substring(0, 60)}
													{lastError.message.length > 60 ? "..." : ""}
												</div>
											) : (
												<div>No error description available</div>
											)}
										</div>
										{lastError && (
											<div className="flex items-center text-xs text-muted-foreground">
												<Calendar className="h-3 w-3 mr-1" />
												<span className="flex items-center justify-center flex-wrap">
													{new Date(lastError.occurredAt).toLocaleDateString()}
													<Clock className="h-3 w-3 ml-2 mr-1" />
													{new Date(lastError.occurredAt).toLocaleTimeString(
														[],
														{
															hour: "2-digit",
															minute: "2-digit",
														},
													)}
												</span>
											</div>
										)}
									</CardContent>
								</Card>
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default ErrorLogsClient;
