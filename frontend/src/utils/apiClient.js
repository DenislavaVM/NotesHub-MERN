import axios from "axios";

const createApiClient = () => {
    let accessToken = null;

    const apiClient = axios.create({
        baseURL: import.meta.env.VITE_API_URL,
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
        },
    });

    const setApiAccessToken = (token) => {
        accessToken = token;
    };

    const getAccessToken = () => {
        return accessToken;
    };

    const sessionExpiredEvent = new Event("sessionExpired");

    apiClient.interceptors.request.use(
        (config) => {
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        },
    );

    apiClient.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            const url = originalRequest.url;
            const status = error.response?.status;

            const handleSessionExpired = () => {
                setApiAccessToken(null);
                window.dispatchEvent(sessionExpiredEvent);
            };

            if (url === "/auth/refresh" && (status === 401 || status === 403)) {
                handleSessionExpired();
                return Promise.reject(error);
            }

            if (url === "/auth/login" || url === "/auth/create-account") {
                return Promise.reject(error);
            };

            if (status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    const response = await apiClient.get("/auth/refresh");
                    const newAccessToken = response.data.accessToken;
                    setApiAccessToken(newAccessToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    handleSessionExpired();
                    const sessionError = new Error("Session expired");
                    sessionError.name = "SessionExpiredError";
                    return Promise.reject(sessionError);
                };
            };
            return Promise.reject(error);
        },
    );

    return { apiClient, setApiAccessToken, getAccessToken };
};

const { apiClient, setApiAccessToken, getAccessToken } = createApiClient();

export { setApiAccessToken, getAccessToken };
export default apiClient;