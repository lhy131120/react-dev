import { api } from "@/services";
import { useState, useEffect, useEffectEvent, useMemo } from "react";
import ProductCard from "@/components/ProductCard.jsx";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

const Products = () => {
	const navigate = useNavigate();
	const [products, setProducts] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState("all");

	// 用 useMemo 計算分類選項
	const options = useMemo(
		() => [...new Set(products.map((product) => product.subcategory))],
		[products]
	);

	// 用 useMemo 計算篩選後的產品
	const filteredProducts = useMemo(
		() =>
			selectedCategory === "all"
				? products
				: products.filter((product) => product.subcategory === selectedCategory),
		[products, selectedCategory]
	);

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
				<h2 className="fs-2 fw-bold mb-3" style={{ color: "#92400e" }}>
					🛒 我們的調味料系列
				</h2>
				<div className="d-flex justify-content-between align-items-center">
					<div className="d-flex gap-2 flex-wrap">
						<span className="badge bg-primary">精選調味</span>
						<span className="badge bg-success">新鮮進口</span>
					</div>
					{options.length > 0 && (
						<select
							className="form-select w-auto"
							aria-label="Product Category Filter"
							value={selectedCategory}
							onChange={(e) => setSelectedCategory(e.target.value)}
						>
							<option value="all">全部分類</option>
							{options.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					)}
				</div>
			</div>
			{filteredProducts.length === 0 ? (
				<h2 className="text-center py-5" style={{ color: "#92400e" }}>
					目前沒有產品資料...
				</h2>
			) : (
				<div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-3 mb-5">
					{filteredProducts.map((item) => (
						<ProductCard key={item.id} product={item} getProductDetails={getProductDetails} />
					))}
				</div>
			)}
		</>
	);
};

export default Products;
