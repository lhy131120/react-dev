import { api } from "@/services";
import { useState, useEffect, useEffectEvent } from "react";
import ProductCard from "@/components/ProductCard.jsx";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

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
			toast.error(`取得產品列表失敗: ${error?.response?.data?.message || "請稍後再試"}`);
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
			<div className="mb-5">
				<h2 className="fs-2 fw-bold mb-3" style={{ color: '#92400e' }}>
					🛒 我們的調味料系列
				</h2>
				<div className="d-flex gap-2 flex-wrap">
					<span className="badge bg-primary">精選調味</span>
					<span className="badge bg-success">新鮮進口</span>
				</div>
			</div>
			{products.length === 0 ? (
				<h2 className="text-center py-5" style={{ color: '#92400e' }}>目前沒有產品資料...</h2>
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
