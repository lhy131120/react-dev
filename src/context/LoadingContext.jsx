import { createContext, useContext, useState, useCallback } from "react";

// 创建 Context
const LoadingContext = createContext();

// Provider 组件
export const LoadingProvider = ({ children }) => {
	const [isLoading, setIsLoading] = useState(false);

	const showLoading = useCallback(() => {
		setIsLoading(true);
	}, []);

	const hideLoading = useCallback(() => {
		setIsLoading(false);
	}, []);

	const value = {
		isLoading,
		showLoading,
		hideLoading,
	};

	return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
};

// Hook - 在组件中使用
export const useLoading = () => {
	const context = useContext(LoadingContext);
	if (!context) {
		throw new Error("useLoading 必须在 LoadingProvider 内使用");
	}
	return context;
};
