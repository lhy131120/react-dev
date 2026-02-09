import { api } from "@/services";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { toast } from "react-toastify";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "@/styles/Swiper.css";

const Home = () => {
	const [products, setProducts] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		const getProducts = async () => {
			// Loading 由 axios interceptor 自動處理
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
		};

		getProducts();
	}, []);

	return (
		<>
			{/* 頁面標題 */}
			<div className="swiper-page-header text-center">
				<h2 className="swiper-page-title">🌶️ 熱帶調味料天堂</h2>
				<p className="swiper-page-subtitle">探索來自世界各地的優質調味料，為您的廚房增添異域風情</p>
			</div>

			{/* 產品swiper */}
			{products.length > 0 ? (
				<div className="swiper-container">
					<Swiper
						modules={[Navigation, Pagination, Autoplay]}
						grabCursor={true}
						pagination={{ clickable: true, dynamicBullets: true }}
						navigation={true}
						speed={600}
						loop={true}
						slidesPerView="auto"
						centeredSlides={true}
						className="product-swiper"
					>
						{products.map((product) => (
							<SwiperSlide key={product.id}>
								<div
									className="product-card"
									onClick={() => navigate(`/product/${product.id}`)}
									style={{ cursor: "pointer" }}
								>
									{/* 產品圖片 */}
									<img
										src={product.imageUrl}
										alt={product.title}
										className="product-image"
										onError={(e) => {
											e.target.src = "https://placehold.co/300x200?text=No+Image";
										}}
									/>

									{/* 產品資訊 */}
									<div className="product-info">
										<h5 className="product-title">{product.title}</h5>
										<span className="product-category">{product.category}</span>

										{product.description && <p className="product-description">{product.description}</p>}

										{/* 價格 */}
										<div className="product-price">
											<span className="product-price-current">NT${product.price}</span>
											{product.origin_price && product.origin_price > product.price && (
												<>
													<span className="product-price-original">NT${product.origin_price}</span>
													<span className="product-discount">
														{Math.round(((product.origin_price - product.price) / product.origin_price) * 100)}% OFF
													</span>
												</>
											)}
										</div>
									</div>

									{/* 啟用狀態徽章 */}
									<div style={{ marginTop: "auto", paddingTop: "0.5rem" }}>
										<span className={`badge ${product.is_enabled === 1 ? "bg-success" : "bg-secondary"}`}>
											{product.is_enabled === 1 ? "啟用" : "未啟用"}
										</span>
									</div>
								</div>
							</SwiperSlide>
						))}
					</Swiper>
				</div>
			) : (
				<div className="swiper-empty-state">
					<p className="swiper-empty-text">暫無產品</p>
				</div>
			)}
		</>
	);
};

export default Home;
