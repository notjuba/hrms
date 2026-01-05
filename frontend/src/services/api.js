const getBaseUrl = () => {
    let url = import.meta.env.VITE_API_URL || '/api';
    // Ensure URL ends with /api if it's a full URL (not a relative path like '/api')
    if (url.startsWith('http') && !url.endsWith('/api')) {
        url = url.endsWith('/') ? `${url}api` : `${url}/api`;
    }
    return url;
};

const API_BASE_URL = getBaseUrl();

const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers
            },
            ...options
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // Check if response is HTML (common when VITE_API_URL is missing/wrong and Netlify returns index.html)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            console.error('Received HTML instead of JSON. Check VITE_API_URL configuration.');
            console.error('Current API_BASE_URL:', API_BASE_URL);
            throw new Error('API Configuration Error: Received HTML response. Check VITE_API_URL.');
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(data?.error || 'An error occurred');
        }

        return { data, status: response.status };
    },

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    patch(endpoint, body) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body)
        });
    },

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};

export default api;
