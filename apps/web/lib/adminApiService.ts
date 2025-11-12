const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api/v1';

const buildUrl = (path: string, params?: Record<string, any>): string => {
  const url = new URL(path, API_BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
};

const apiFetch = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include', 
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    if (response.status === 401) {
      console.error('Unauthorized access - redirect to login');
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
};

const adminApiService = {
  getDashboardStats: (token: string) =>
    apiFetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getAllUsers: (
    token: string,
    params?: { page?: number; limit?: number; search?: string }
  ) =>
    apiFetch(buildUrl('/admin/users', params), {
      headers: { Authorization: `Bearer ${token}` },
    }),

  deleteUser: (userId: string, token: string) =>
    apiFetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),

  getAllRepositories: (
    token: string,
    params?: { page?: number; limit?: number; search?: string }
  ) =>
    apiFetch(buildUrl('/admin/repositories', params), {
      headers: { Authorization: `Bearer ${token}` },
    }),

  deleteRepository: (repoId: string, token: string) =>
    apiFetch(`${API_BASE_URL}/admin/repositories/${repoId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),

  toggleRepositoryStatus: (repoId: string, isActive: boolean, token: string) =>
    apiFetch(`${API_BASE_URL}/admin/repositories/${repoId}/toggle-status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive }),
    }),

  getAllPayments: (
    token: string,
    params?: { page?: number; limit?: number; search?: string; status?: string }
  ) =>
    apiFetch(buildUrl('/admin/payments', params), {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export default adminApiService;