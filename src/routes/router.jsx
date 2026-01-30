import { createHashRouter } from "react-router";

import FrontendLayout from "../layout/FrontendLayout";
import Home from "../views/front/Home";
import Products from "../views/front/Products";
import Product from "../views/front/Product";
import Cart from "../views/front/Cart";
import Login from "../views/front/Login";
import NotFound from "../views/front/NotFound";

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
				path: "login",
				element: <Login />,
			},
		],
	},
	{
		path: "*",
		element: <NotFound />,
	},
]);

export default router;
