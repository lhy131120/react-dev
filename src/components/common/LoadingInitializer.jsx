import { useEffect } from "react";
import { useLoading } from "@/hooks";
import { injectLoadingController } from "@/services";

/**
 * LoadingInitializer
 * 將 Loading Context 注入到 axios interceptor
 * 必須放在 LoadingProvider 內部
 */
const LoadingInitializer = ({ children }) => {
	const { showLoading, hideLoading, forceHideLoading } = useLoading();

	useEffect(() => {
		// 注入 loading 控制器到 axios
		injectLoadingController({
			show: showLoading,
			hide: hideLoading,
			forceHide: forceHideLoading,
		});
	}, [showLoading, hideLoading, forceHideLoading]);

	return children;
};

export default LoadingInitializer;
