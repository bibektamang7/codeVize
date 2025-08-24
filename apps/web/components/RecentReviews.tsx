import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import EmptyReview from "@/pages/EmptyReview";

interface PullRequestProps {
	title: string;
	repository: string;
	status: string;
	lastUpdated: Date;
}

export default function RecentPullRequests() {
	const pullRequests: PullRequestProps[] = [
		// {
		// 	title: "Fix: Resolve issue with user authentication",
		// 	repository: "WebApp",
		// 	status: "Reviewed",
		// 	lastUpdated: "2023-08-15",
		// },
		// {
		// 	title: "Feature: Implement new search functionality",
		// 	repository: "WebApp",
		// 	status: "Waiting",
		// 	lastUpdated: "2023-08-14",
		// },
		// {
		// 	title: "Refactor: Improve code readability in API module",
		// 	repository: "MobileApp",
		// 	status: "Tagged",
		// 	lastUpdated: "2023-08-13",
		// },
		// {
		// 	title: "Docs: Update documentation for new features",
		// 	repository: "WebApp",
		// 	status: "Reviewed",
		// 	lastUpdated: "2023-08-12",
		// },
		// {
		// 	title: "Bug: Correct issue with data validation",
		// 	repository: "MobileApp",
		// 	status: "Waiting",
		// 	lastUpdated: "2023-08-11",
		// },
	];

	const getStatusVariant = (status: string) => {
		switch (status) {
			case "Reviewed":
				return "secondary";
			case "Waiting":
				return "outline";
			case "Tagged":
				return "default";
			default:
				return "secondary";
		}
	};

	return (
		<>
			{pullRequests.length !== 0 ? (
				<div className="bg-black mt-4 text-white p-6">
					<h2 className="text-xl font-semibold mb-4">Recent Pull Requests</h2>

					<div className="rounded-lg border border-gray-700">
						<Table>
							<TableHeader>
								<TableRow className="border-gray-700 hover:bg-gray-800">
									<TableHead className="text-gray-300 font-medium">
										PR Title
									</TableHead>
									<TableHead className="text-gray-300 font-medium">
										Repository
									</TableHead>
									<TableHead className="text-gray-300 font-medium">
										Status
									</TableHead>
									<TableHead className="text-gray-300 font-medium">
										Last Updated
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{pullRequests.map((pr, index) => (
									<TableRow
										key={index}
										className="border-gray-700 hover:bg-gray-750 !py-20"
									>
										<TableCell className="text-white font-medium">
											{pr.title}
										</TableCell>
										<TableCell className="text-gray-400">
											{pr.repository}
										</TableCell>
										<TableCell>
											<Badge
												variant={getStatusVariant(pr.status)}
												className="bg-gray-700 text-gray-200 hover:bg-gray-600 border-gray-600"
											>
												{pr.status}
											</Badge>
										</TableCell>
										<TableCell className="text-gray-400">
											{pr.lastUpdated.toDateString()}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</div>
			) : (
				<EmptyReview />
			)}
		</>
	);
}
