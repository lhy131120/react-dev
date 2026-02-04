import { useContext } from "react";
import { LoadingContext } from "@/context/loading";

/**
 * useLoading Hook
 * 用於在元件中控制全域 Loading 狀態
 * 
 * @returns {{ isLoading: boolean, showLoading: () => void, hideLoading: () => void, forceHideLoading: () => void }}
 */
export const useLoading = () => {
	const context = useContext(LoadingContext);
	if (!context) {
		throw new Error("useLoading 必須在 LoadingProvider 內使用");
	}
	return context;
};
