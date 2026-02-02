import { api } from "../../api/axiosInstance.js";
import { useState, useEffect, useEffectEvent } from "react";
import ProductCard from "../../components/ProductCard.jsx";
import { useNavigate } from "react-router";

const { VITE_API_BASE, VITE_API_PATH } = import.meta.env;

const Products = () => {
	const navigate = useNavigate();
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

	const getProductDetails = (id) => {
		navigate(`/product/${id}`);
	};

	useEffect(() => {
		getProducts();
	}, []);

	return (
		<>
			<h2 className="fs-4 fw-bold text-primary mb-4">產品列表</h2>
			{/* {JSON.stringify(products)} */}
			{products.length === 0 ? (
				<h2 className="text-center py-5 text-white">目前沒有產品資料...</h2>
			) : (
				<div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-3 mb-5">
					{products.map((item) => (
						<ProductCard key={item.id} product={item} getProductDetails={getProductDetails} />
					))}
				</div>
			)}
		</>
	);
};

export default Products;
