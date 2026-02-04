import { createHashRouter } from "react-router";

import FrontendLayout from "@/layout/FrontendLayout";
import Home from "@/views/front/Home";
import Products from "@/views/front/Products";
import Product from "@/views/front/Product";
import Cart from "@/views/front/Cart";
import Login from "@/views/front/Login";

import BackendLayout from "@/layout/BackendLayout";
import Dashboard from "@/views/admin/Dashboard";
import AdminSetting from "@/views/admin/AdminSetting";

import NotFound from "@/views/front/NotFound";

import AuthRoute from "@/components/AuthRoute";
import ProtectedRoute from "@/components/ProtectedRoute";

const router = createHashRouter([
	{
		path: "/",
		element: <FrontendLayout />,
		children: [
			{
				path: "/",
				element: <Home />,
			},
			{
				path: "products",
				element: <Products />,
			},
			{
				path: "product/:id",
				element: <Product />,
			},
			{
				path: "cart",
				element: <Cart />,
			},
			{
				element: <AuthRoute />,
				children: [
					{
						path: "login",
						element: <Login />,
					},
				],
			},
		],
	},
	{
		path: "/admin",
		element: <BackendLayout />,
		children: [
			{
				element: <ProtectedRoute />,
				children: [
					{
						path: "dashboard",
						element: <Dashboard />,
					},
					{
						path: "setting",
						element: <AdminSetting />,
					},
				],
			},
		],
	},
	{
		path: "*",
		element: <NotFound />,
	},
]);

export default router;
