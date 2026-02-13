import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { checkAuth } from "@/store/authSlice";
import { Navigate, Outlet } from "react-router";

const AuthRoute = () => {
	const dispatch = useDispatch();
	const { isAuthenticated } = useSelector((state) => state.auth);

	useEffect(() => {
		if (isAuthenticated === null) {
			dispatch(checkAuth());
		}
	}, [dispatch, isAuthenticated]);

	if (isAuthenticated === null) {
		return <h2 className="text-center py-5">檢查登入狀態中...</h2>;
	}

	if (isAuthenticated) {
		return <Navigate to="/admin/dashboard" replace />;
	}

	return <Outlet />;
};

export default AuthRoute;
