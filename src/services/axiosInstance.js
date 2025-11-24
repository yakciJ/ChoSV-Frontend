import axios from "axios";

const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

instance.interceptors.request.use(
    function (config) {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

// Add a response interceptor
instance.interceptors.response.use(
    (response) => response.data,
    async function (error) {
        const originalRequest = error.config;

        console.log(">>> check error: ", error);

        // Handle 401 errors with token refresh attempt
        if (error?.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Queue the request while refreshing
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    // Retry with new token
                    const newToken = localStorage.getItem("access_token");
                    if (newToken) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    }
                    return instance(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Import refreshToken here to avoid circular dependency
                const { refreshToken } = await import('../services/authService');
                
                // Use your existing refreshToken method
                const refreshResponse = await refreshToken();
                
                // Update access token in localStorage
                const newAccessToken = refreshResponse.accessToken;
                localStorage.setItem("access_token", newAccessToken);

                // Process queued requests
                processQueue(null, newAccessToken);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return instance(originalRequest);

            } catch (refreshError) {
                // Refresh failed - clear token and handle based on request type
                localStorage.clear();
                if (window.__store) {
                    window.__store.dispatch({ type: "RESET_STORE" });
                }
                processQueue(refreshError, null);
                
                // Only redirect if not an optional request
                if (!originalRequest.skipAuthRedirect) {
                    window.location.href = '/login';
                } else {
                    // For optional requests, just reject the promise
                    return Promise.reject(refreshError);
                }
            } finally {
                isRefreshing = false;
            }
        }

        //if (error?.response) return error?.response;
        return Promise.reject(error);
    }
);

export default instance;