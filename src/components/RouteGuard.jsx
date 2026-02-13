import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { checkAuth } from "@/store/authSlice";
import { Navigate, Outlet } from "react-router";

/**
 * RouteGuard — 統一的路由守衛元件
 * @param {"auth" | "protected"} type
 *   - "auth":      已登入 → 重導至後台（用於 Login 頁面，避免重複登入）
 *   - "protected": 未登入 → 重導至 Login（用於後台頁面，保護資源）
 */
const RouteGuard = ({ type }) => {
	const dispatch = useDispatch();
	const { isAuthenticated } = useSelector((state) => state.auth);

	useEffect(() => {
		if (isAuthenticated === null) {
			dispatch(checkAuth());
		}
	}, [dispatch, isAuthenticated]);

	if (isAuthenticated === null) {
		return (
			<div className="d-flex justify-content-center align-items-center py-5">
				<div className="spinner-border text-primary" role="status">
					<span className="visually-hidden">檢查登入狀態中...</span>
				</div>
			</div>
		);
	}

	if (type === "auth" && isAuthenticated) {
		return <Navigate to="/admin/dashboard" replace />;
	}

	if (type === "protected" && !isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return <Outlet />;
};

export default RouteGuard;
