import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getReposWithErrorLogs } from "@/lib/actions";
import { AlertTriangle, GitBranch, Calendar, Clock } from "lucide-react";
import { RepositoryProps } from "@/types/model.types";

const ErrorLogsPage = async () => {
	const repos = await getReposWithErrorLogs();

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Error Logs</h1>
				<p className="text-muted-foreground mt-2">
					View error logs from your repositories
				</p>
			</div>

			{repos.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center">
						<AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-xl font-semibold">No Error Logs Found</h3>
						<p className="text-muted-foreground mt-2">
							There are no repositories with error logs at this time.
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{repos.map((repo: RepositoryProps) => {
						const lastError =
							repo.repoConfig?.errorLogs && repo.repoConfig?.errorLogs[0];
						return (
							<div key={repo.id}>
								<Card className="hover:shadow-lg transition-shadow cursor-pointer">
									<CardHeader className="pb-3">
										<div className="flex justify-between items-start">
											<CardTitle className="flex items-center gap-2">
												<GitBranch className="h-5 w-5" />
												<span className="truncate">{repo.repoName}</span>
											</CardTitle>
											<Badge
												variant="destructive"
												className="ml-2"
											>
												{repo.repoConfig?.errorLogs?.length || 0} errors
											</Badge>
										</div>
									</CardHeader>
									<CardContent>
										<div className="text-sm text-muted-foreground mb-3">
											{lastError ? (
												<div className="truncate">
													<span className="font-medium">Last error:</span>{" "}
													{lastError.message}
												</div>
											) : (
												<div>No error description available</div>
											)}
										</div>
										{lastError && (
											<div className="flex items-center text-xs text-muted-foreground">
												<Calendar className="h-3 w-3 mr-1" />
												<span>
													{lastError.occurredAt.toLocaleDateString()}
													<Clock className="h-3 w-3 ml-3 mr-1 inline" />
													{lastError.occurredAt.toLocaleTimeString([], {
														hour: "2-digit",
														minute: "2-digit",
													})}
												</span>
											</div>
										)}
									</CardContent>
								</Card>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default ErrorLogsPage;
