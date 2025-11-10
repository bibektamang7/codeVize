import axios from "axios";
import { headers } from "next/headers";

const API_BASE_URL =
	process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api/v1";

const apiClient = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});

apiClient.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("admin_token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Handle unauthorized access (redirect to login, etc.)
			console.error("Unauthorized access - redirect to login");
			// You might want to redirect the user to login here
		}
		return Promise.reject(error);
	}
);

// Admin API service
const adminApiService = {
	getDashboardStats: (token: string) =>
		apiClient.get("/admin/dashboard/stats", {
			headers: { Authorization: `Bearer ${token}` },
		}),

	getAllUsers: (
		token: string,
		params?: { page?: number; limit?: number; search?: string }
	) =>
		apiClient.get("/admin/users", {
			params,
			headers: { Authorization: `Bearer ${token}` },
		}),
	deleteUser: (userId: string, token: string) =>
		apiClient.delete(`/admin/users/${userId}`, {
			headers: { Authorization: `Bearer ${token}` },
		}),

	getAllRepositories: (
		token: string,
		params?: {
			page?: number;
			limit?: number;
			search?: string;
		}
	) =>
		apiClient.get("/admin/repositories", {
			params,
			headers: { Authorization: `Bearer ${token}` },
		}),
	deleteRepository: (repoId: string, token: string) =>
		apiClient.delete(`/admin/repositories/${repoId}`, {
			headers: { Authorization: `Bearer ${token}` },
		}),
	toggleRepositoryStatus: (repoId: string, isActive: boolean, token: string) =>
		apiClient.patch(
			`/admin/repositories/${repoId}/toggle-status`,
			{
				isActive,
			},
			{ headers: { Authorization: `Bearer ${token}` } }
		),

	getAllPayments: (
		token: string,
		params?: {
			page?: number;
			limit?: number;
			search?: string;
			status?: string;
		}
	) =>
		apiClient.get("/admin/payments", {
			params,
			headers: { Authorization: `Bearer ${token}` },
		}),
};

export default adminApiService;
