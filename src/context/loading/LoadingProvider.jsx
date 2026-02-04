import { useState, useCallback, useRef } from "react";
import { LoadingContext } from "./LoadingContext";

// Loading Provider 元件
export const LoadingProvider = ({ children }) => {
	const [isLoading, setIsLoading] = useState(false);
	const loadingCount = useRef(0);

	// 使用計數器處理多個並發請求
	const showLoading = useCallback(() => {
		loadingCount.current += 1;
		if (loadingCount.current === 1) {
			setIsLoading(true);
		}
	}, []);

	const hideLoading = useCallback(() => {
		loadingCount.current = Math.max(0, loadingCount.current - 1);
		if (loadingCount.current === 0) {
			setIsLoading(false);
		}
	}, []);

	// 強制隱藏 loading（用於錯誤處理等情況）
	const forceHideLoading = useCallback(() => {
		loadingCount.current = 0;
		setIsLoading(false);
	}, []);

	const value = {
		isLoading,
		showLoading,
		hideLoading,
		forceHideLoading,
	};

	return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
};
