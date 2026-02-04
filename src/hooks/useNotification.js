import { toast } from "react-toastify";
import { useCallback, useRef, useMemo } from "react";
import { useLoading } from "./useLoading";

/**
 * useNotification Hook
 * 整合 Toast 和 Loading，避免重疊顯示
 * 
 * 特性：
 * - 當 loading 中觸發 toast 時，會先關閉 loading
 * - 提供統一的成功/錯誤/資訊通知介面
 * - 支援靜默模式（不顯示 toast）
 */
export const useNotification = () => {
	const { showLoading, hideLoading, forceHideLoading, isLoading } = useLoading();
	const toastDebounceRef = useRef(null);

	// 預設 toast 設定 - 使用 useMemo 避免依賴問題
	const defaultToastConfig = useMemo(() => ({
		autoClose: 2000,
		hideProgressBar: false,
		closeOnClick: true,
		pauseOnHover: true,
		draggable: true,
	}), []);

	// 顯示成功通知（會先關閉 loading）
	const notifySuccess = useCallback((message, options = {}) => {
		if (isLoading) {
			forceHideLoading();
		}
		
		// 防抖：避免短時間內重複顯示相同訊息
		if (toastDebounceRef.current) {
			clearTimeout(toastDebounceRef.current);
		}
		
		toastDebounceRef.current = setTimeout(() => {
			toast.success(message, { ...defaultToastConfig, ...options });
		}, 100);
	}, [isLoading, forceHideLoading, defaultToastConfig]);

	// 顯示錯誤通知（會先關閉 loading）
	const notifyError = useCallback((message, options = {}) => {
		forceHideLoading();
		toast.error(message, { 
			...defaultToastConfig, 
			autoClose: 3000,
			theme: "colored",
			...options 
		});
	}, [forceHideLoading, defaultToastConfig]);

	// 顯示資訊通知
	const notifyInfo = useCallback((message, options = {}) => {
		if (isLoading) {
			forceHideLoading();
		}
		toast.info(message, { ...defaultToastConfig, ...options });
	}, [isLoading, forceHideLoading, defaultToastConfig]);

	// 顯示警告通知
	const notifyWarning = useCallback((message, options = {}) => {
		if (isLoading) {
			forceHideLoading();
		}
		toast.warning(message, { ...defaultToastConfig, ...options });
	}, [isLoading, forceHideLoading, defaultToastConfig]);

	return {
		showLoading,
		hideLoading,
		forceHideLoading,
		isLoading,
		notifySuccess,
		notifyError,
		notifyInfo,
		notifyWarning,
	};
};
