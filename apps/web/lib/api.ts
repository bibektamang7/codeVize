import axios from "axios";

const API_BASE_URL =
	process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

export const repositoryAPI = {
	// deleteRepository: async (repoId: string, token: string) => {
	// 	const response = await api.delete(`/repositories/repository/${repoId}`, {
	// 		headers: {
	// 			Authorization: `Bearer ${token}`,
	// 		},
	// 	});
	// 	return response;
	// },

	activateRepository: async (repoId: string, token: string) => {
		const response = await api.post(
			`/repositories/repository/${repoId}/activate`,
			{},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);
		return response;
	},

	deactivateRepository: async (repoId: string, token: string) => {
		const response = await api.post(
			`/repositories/repository/${repoId}/deactivate`,
			{},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);
		return response;
	},
};

export default api;
