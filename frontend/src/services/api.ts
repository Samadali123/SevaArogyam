export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
export const AUTH_TOKEN_KEY = 'SEVASADAN_TOKEN';

export const saveAuthToken = (token: unknown) => {
  if (typeof token === 'string' && token.trim()) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    return token;
  }
  throw new Error('Login succeeded but no access token was returned. Please try again.');
};

export const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.') => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const value = error as { message?: unknown; error?: { message?: unknown } };
    if (typeof value.error?.message === 'string') return value.error.message;
    if (typeof value.message === 'string') return value.message;
  }
  return fallback;
};

/**
 * Helper function to perform API requests with automatic token injection.
 */
export const fetchApi = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get token from local storage
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // Only set Content-Type to application/json if body is not FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    // Attempt to extract error message from standard API error response
    const errorMessage = getApiErrorMessage(data, response.statusText);
      
    // Optionally handle 401 Unauthorized globally here (e.g. log out user)
    if (response.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      // window.location.href = '/'; // Alternatively handle via context
    }

    throw new Error(errorMessage);
  }

  return data;
};

// Expose simplified methods
export const api = {
  get: (endpoint: string) => fetchApi(endpoint, { method: 'GET' }),
  post: (endpoint: string, body: any) => fetchApi(endpoint, { 
    method: 'POST', 
    body: body instanceof FormData ? body : JSON.stringify(body) 
  }),
  put: (endpoint: string, body: any) => fetchApi(endpoint, { 
    method: 'PUT', 
    body: body instanceof FormData ? body : JSON.stringify(body) 
  }),
  delete: (endpoint: string) => fetchApi(endpoint, { method: 'DELETE' })
};
