import { api } from "../../api/axiosInstance.js";
import { useState, useEffect, useEffectEvent } from "react";

const Home = () => {
	const [products, setProducts] = useState([]);

	const getProducts = useEffectEvent(async () => {
		try {
			const response = await api.get("/products/all");
			const { products } = response.data;
			const productArr = Object.keys(products).map((id) => ({
				id,
				...products[id],
			}));
			setProducts(productArr);
		} catch (error) {
			console.error("取得產品列表失敗:", error?.response?.data || error);
		}
	});

	useEffect(() => {
		getProducts();
	}, []);

	return (
		<>
			<h2 className="fs-4 fw-bold text-primary mb-0">Home</h2>
      {JSON.stringify(products)}
		</>
	);
};

export default Home;
