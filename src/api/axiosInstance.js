import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

const api = axios.create({
	baseURL: `${API_BASE}/api/${API_PATH}`,
	timeout: 10000,
});

api.interceptors.request.use(config => {
		const token = getTokenFromCookie(); 

		if (token) {
			config.headers.Authorization = `${token}`;
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

api.interceptors.response.use((response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// token 無效或過期
			console.warn("Token 無效或過期，需重新登入");
			document.cookie = "hexToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
			axios.defaults.headers.common["Authorization"] = null;
      // 提示 error msg
			alert("登入已過期，請重新登入");
		}
		return Promise.reject(error);
	}
);

function getTokenFromCookie() {
	const name = "hexToken=";
	const decodedCookie = decodeURIComponent(document.cookie);
	const ca = decodedCookie.split(";");
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i].trim();
		if (c.indexOf(name) === 0) {
			return c.substring(name.length);
		}
	}
	return "";
}

export const authApi = axios.create({
	baseURL: API_BASE,
  withCredentials: true,
});

export default api