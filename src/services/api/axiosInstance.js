import axios from "axios";
import { API_BASE, API_PATH, getTokenFromCookie  } from "./config";

// Loading 控制器（將在 App 初始化時注入）
let loadingController = {
	show: () => {},
	hide: () => {},
	forceHide: () => {},
};

// 注入 Loading 控制器
export const injectLoadingController = (controller) => {
	loadingController = controller;
};

// 需要顯示 loading 的請求（用於標記）
const pendingRequests = new Set();

// 建立 API 實例
export const api = axios.create({
	baseURL: `${API_BASE}/api/${API_PATH}`,
	timeout: 10000,
	withCredentials: true,
});

export const plainApi = axios.create({
	baseURL: API_BASE,
	timeout: 10000,
	withCredentials: true,
});

// Request interceptor - 自動帶 token 和顯示 loading
const requestInterceptor = (config) => {
	const token = getTokenFromCookie();
	if (token) {
		config.headers.Authorization = `${token}`;
	}

	// 檢查是否需要顯示 loading（預設顯示，除非 config.silent = true）
	if (!config.silent) {
    const requestId = `${config.method}-${config.url}-${Date.now()}`;
		config._requestId = requestId;
		pendingRequests.add(requestId);
		
		// 只有第一個請求時才顯示 loading
		if (pendingRequests.size === 1) {
			loadingController.show();
		}
	}

	return config;
};

// Response interceptor - 隱藏 loading 和處理 401
const responseSuccessHandler = (response) => {
	const { config } = response;
	
	if (config._requestId) {
		pendingRequests.delete(config._requestId);
		
		// 所有請求完成時隱藏 loading
		if (pendingRequests.size === 0) {
			loadingController.hide();
		}
	}
	
	return response;
};

const responseErrorHandler = (error) => {
	const { config, response } = error;
	
	// 移除 pending 請求
	if (config?._requestId) {
		pendingRequests.delete(config._requestId);
		
		if (pendingRequests.size === 0) {
			loadingController.forceHide();
		}
	}

	// 401 處理
	if (response?.status === 401) {
		document.cookie = "hexToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
		window.location.href = `${import.meta.env.BASE_URL}#/login`;
	}

	return Promise.reject(error);
};

// 註冊 interceptors
api.interceptors.request.use(requestInterceptor);
plainApi.interceptors.request.use(requestInterceptor);

api.interceptors.response.use(responseSuccessHandler, responseErrorHandler);
plainApi.interceptors.response.use(responseSuccessHandler, responseErrorHandler);

