import axios from "axios";

const TOKEN_STORAGE_KEY = "accessToken";

const createApiClient = () => {
    let accessToken = localStorage.getItem(TOKEN_STORAGE_KEY) || null;

    const apiClient = axios.create({
        baseURL: import.meta.env.VITE_API_URL,
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
        },
    });


    const setApiAccessToken = (token) => {
        accessToken = token;
        if (token) {
            localStorage.setItem(TOKEN_STORAGE_KEY, token);
        } else {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
    };

    const getAccessToken = () => accessToken;

    const sessionExpiredEvent = new Event("sessionExpired");

    apiClient.interceptors.request.use(
        (config) => {
            const base = import.meta.env.VITE_API_URL || "";
            const urlPath = (config.url || "").replace(base, "");
            const isRefresh = urlPath.endsWith("/auth/refresh");

            if (!isRefresh && accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    apiClient.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            const status = error.response?.status;

            const handleSessionExpired = () => {
                setApiAccessToken(null);
                window.dispatchEvent(sessionExpiredEvent);
            };

            const base = import.meta.env.VITE_API_URL || "";
            const urlPath = (originalRequest?.url || "").replace(base, "");
            if (urlPath === "/auth/refresh" && (status === 401 || status === 403)) {
                handleSessionExpired();
                return Promise.reject(error);
            }

            if (urlPath === "/auth/login" || urlPath === "/auth/create-account") {
                return Promise.reject(error);
            }

            if (status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    const refreshRes = await apiClient.get("/auth/refresh");
                    const newAccessToken =
                        refreshRes?.data?.accessToken ??
                        refreshRes?.data?.data?.accessToken ??
                        refreshRes?.accessToken;

                    if (!newAccessToken) {
                        throw new Error("No access token returned from refresh");
                    }

                    setApiAccessToken(newAccessToken);
                    originalRequest.headers = {
                        ...(originalRequest.headers || {}),
                        Authorization: `Bearer ${newAccessToken}`,
                    };
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    handleSessionExpired();
                    const sessionError = new Error("Session expired");
                    sessionError.name = "SessionExpiredError";
                    return Promise.reject(sessionError);
                }
            }

            return Promise.reject(error);
        }
    );

    return { apiClient, setApiAccessToken, getAccessToken };
};

const { apiClient, setApiAccessToken, getAccessToken } = createApiClient();

export { setApiAccessToken, getAccessToken };
export default apiClient;