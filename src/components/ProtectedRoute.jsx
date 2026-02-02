import { plainApi } from "../api/axiosInstance";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
	const [isAuthenticated, setIsAuthenticated] = useState(null);

	useEffect(() => {
		let isMounted = true;

		const checkAuth = async () => {
			try {
				await plainApi.post("/api/user/check");
				if (isMounted) setIsAuthenticated(true);
			} catch (error) {
				console.log("檢查登入失敗", error?.response?.data || error.message);
				if (isMounted) setIsAuthenticated(false);
			}
		};
		checkAuth();

		return () => {
			isMounted = false; // 防止 unmount 後還 setState
		};
	}, []);

	if (isAuthenticated === null) {
		return <h2 className="text-center py-5">檢查登入狀態中...</h2>;
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return <Outlet />;
};

export default ProtectedRoute;
