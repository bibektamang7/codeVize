"use client";

import { useState, useEffect } from "react";
import { Search, Eye, Loader2 } from "lucide-react";
import adminApiService from "@/lib/adminApiService";
import { useSession } from "next-auth/react";

interface Payment {
	id: string;
	pidx: string;
	userId: string;
	userName: string;
	status: string;
	amount: number;
	planName: string;
	validUntil: string | null;
	createdAt: string;
}

export interface Pagination {
	page: number;
	limit: number;
	total: number;
	pages: number;
}

const PaymentsPage = () => {
	const session = useSession();
	const [payments, setPayments] = useState<Payment[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
	const [pagination, setPagination] = useState<Pagination | null>(null);
	const [currentPage, setCurrentPage] = useState(1);

	useEffect(() => {
		fetchPayments();
	}, [searchTerm, currentPage]);

	const fetchPayments = async () => {
		try {
			setLoading(true);
			const response = await adminApiService.getAllPayments(
				session.data?.user?.token!,
				{
					search: searchTerm,
					page: currentPage,
					limit: 10,
				}
			);
			setPayments(response.data.payments);
			setPagination(response.data.pagination);
		} catch (err: any) {
			console.error("Error fetching payments:", err);
			setError(err.response?.data?.message || "Failed to fetch payments");
		} finally {
			setLoading(false);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "COMPLETED":
				return "bg-green-100 text-green-800";
			case "PENDING":
				return "bg-yellow-100 text-yellow-800";
			case "FAILED":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<Loader2 className="h-8 w-8 animate-spin text-blue-500" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center h-full p-6">
				<div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
					<h3 className="text-lg font-medium text-red-800 mb-2">
						Error Loading Payments
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
						Payments Management
					</h1>
					<p className="text-gray-600 mt-1">
						Manage payment transactions and refunds
					</p>
				</div>
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
					<input
						type="text"
						placeholder="Search payments..."
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
									Transaction ID
								</th>
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
									Plan
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Amount
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
									Valid Until
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Date
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
							{payments.map((payment) => (
								<tr
									key={payment.id}
									className={`hover:bg-gray-50 transition-colors ${selectedPayment === payment.id ? "bg-blue-50" : ""}`}
									onClick={() => setSelectedPayment(payment.id)}
								>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-medium text-gray-900">
											{payment.pidx.substring(0, 12)}...
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-900">
											{payment.userName}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-900">
											{payment.planName}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-medium text-gray-900">
											${payment.amount.toFixed(2)}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}
										>
											{payment.status}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{payment.validUntil
											? new Date(payment.validUntil).toLocaleDateString()
											: "N/A"}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{new Date(payment.createdAt).toLocaleDateString()}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<div className="flex items-center justify-end space-x-3">
											<button
												onClick={(e) => {
													e.stopPropagation();
													alert(`View details for payment ${payment.id}`);
												}}
												className="text-blue-600 hover:text-blue-700"
											>
												<Eye className="h-4 w-4" />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{payments.length === 0 && (
					<div className="text-center py-10">
						<p className="text-gray-500">No payments found</p>
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

export default PaymentsPage;
