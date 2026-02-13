import { useParams, useNavigate } from "react-router";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProduct, clearSelectedProduct } from "@/store/productDetailSlice";
import { addToCart } from "@/store/cartSlice";
import { toast } from "react-toastify";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, FreeMode, Zoom } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/free-mode";
import "swiper/css/zoom";
import "@/styles/ProductDetail.css";

const TOAST_OPTIONS = {
	autoClose: 3000,
	hideProgressBar: false,
	closeOnClick: true,
	pauseOnHover: true,
	draggable: true,
	theme: "colored",
};

const Product = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { id } = useParams();

	// 從 Redux store 讀取單一產品
	const { selectedProduct: tempProduct } = useSelector((state) => state.productDetail);
	const { isAddingToCart: loading } = useSelector((state) => state.cart);

	const [thumbsSwiper, setThumbsSwiper] = useState(null);
	const [quantity, setQuantity] = useState(1);
	const [selectedFlavor, setSelectedFlavor] = useState(null);

	// 拉取產品詳情
	useEffect(() => {
		dispatch(fetchProduct(id))
			.unwrap()
			.then((product) => {
				// 預設選擇第一個口味
				if (product.flavor && product.flavor.length > 0) {
					setSelectedFlavor(product.flavor[0]);
				}
			})
			.catch((msg) => {
				toast.error(`取得產品失敗: ${msg}`, TOAST_OPTIONS);
				setTimeout(() => {
					navigate("/products");
				}, 1500);
			});

		// 離開頁面時清空，避免下次進入時閃現舊資料
		return () => {
			dispatch(clearSelectedProduct());
		};
	}, [id, dispatch, navigate]);

	const handleAddCart = useCallback(
		(productId, qty = quantity) => {
			return dispatch(addToCart({ productId, qty }))
				.unwrap()
				.then((res) => {
					toast.success(`${res?.message || "成功加進購物車"}!`, TOAST_OPTIONS);
				})
				.catch((msg) => {
					toast.error(`加入購物車失敗: ${msg}`, TOAST_OPTIONS);
				});
		},
		[dispatch, quantity]
	);

	// 收集所有圖片（memoized）
	const allImages = useMemo(() => {
		if (!tempProduct) return [];
		const images = [];
		if (tempProduct.imageUrl?.trim()) {
			images.push(tempProduct.imageUrl.trim());
		}
		if (tempProduct.imagesUrl?.length > 0) {
			tempProduct.imagesUrl.filter((img) => img && img.trim() !== "").forEach((img) => images.push(img));
		}
		return images;
	}, [tempProduct]);

	// 計算折扣百分比（memoized）
	const discountPercent = useMemo(() => {
		if (!tempProduct || !tempProduct.origin_price || tempProduct.origin_price <= tempProduct.price) {
			return 0;
		}
		return Math.round(((tempProduct.origin_price - tempProduct.price) / tempProduct.origin_price) * 100);
	}, [tempProduct]);

	if (!tempProduct) {
		return null;
	}

	return (
		<div className="product-detail-container">
			{/* 麵包屑導航 */}
			<nav className="product-breadcrumb">
				<span onClick={() => navigate("/")}>首頁</span>
				<span className="separator">/</span>
				<span onClick={() => navigate("/products")}>商品列表</span>
				<span className="separator">/</span>
				<span className="current">{tempProduct.title}</span>
			</nav>

			<div className="product-detail-wrapper">
				{/* 左側：圖片區域 */}
				<div className="product-gallery">
					{/* 主圖 Swiper */}
					<Swiper
						modules={[Navigation, Thumbs, Zoom]}
						navigation
						zoom={{ maxRatio: 2 }}
						thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
						className="product-main-swiper"
					>
						{allImages.map((img, index) => (
							<SwiperSlide key={index}>
								<div className="swiper-zoom-container">
									<img
										src={img}
										alt={`${tempProduct.title} - ${index + 1}`}
										onError={(e) => {
											e.target.src = "https://placehold.co/600x600?text=No+Image";
										}}
									/>
								</div>
							</SwiperSlide>
						))}
						{/* 折扣標籤 */}
						{discountPercent > 0 && <div className="discount-badge">-{discountPercent}% OFF</div>}
					</Swiper>

					{/* 縮圖 Swiper */}
					{allImages.length > 1 && (
						<Swiper
							modules={[FreeMode, Thumbs]}
							onSwiper={setThumbsSwiper}
							spaceBetween={10}
							slidesPerView={4}
							freeMode
							watchSlidesProgress
							className="product-thumbs-swiper"
						>
							{allImages.map((img, index) => (
								<SwiperSlide key={index}>
									<img
										src={img}
										alt={`thumbnail-${index + 1}`}
										onError={(e) => {
											e.target.src = "https://placehold.co/100x100?text=No+Image";
										}}
									/>
								</SwiperSlide>
							))}
						</Swiper>
					)}
				</div>

				{/* 右側：商品資訊 */}
				<div className="product-info">
					{/* 分類標籤 */}
					<div className="product-categories">
						<span className="category-tag">{tempProduct.category}</span>
						{tempProduct.subcategory && <span className="subcategory-tag">{tempProduct.subcategory}</span>}
					</div>

					{/* 商品標題 */}
					<h1 className="product-title">{tempProduct.title}</h1>

					{/* 標籤 */}
					{tempProduct.label && tempProduct.label.length > 0 && (
						<div className="product-labels">
							{tempProduct.label.map((tag, i) => (
								<span key={i} className="label-tag">
									#{tag}
								</span>
							))}
						</div>
					)}

					{/* 價格區塊 */}
					<div className="product-price-block">
						<div className="price-row">
							<span className="current-price">NT${tempProduct.price}</span>
							<span className="price-unit">/ {tempProduct.unit}</span>
						</div>
						{tempProduct.origin_price && tempProduct.origin_price > tempProduct.price && (
							<div className="original-price-row">
								<span className="original-price">NT${tempProduct.origin_price}</span>
								<span className="save-text">省下 NT${tempProduct.origin_price - tempProduct.price}</span>
							</div>
						)}
					</div>

					{/* 商品描述 */}
					<div className="product-description">
						<h3>商品說明</h3>
						<p>{tempProduct.description}</p>
					</div>

					{/* 商品內容 */}
					{tempProduct.content && (
						<div className="product-content">
							<h3>商品內容</h3>
							<p>{tempProduct.content}</p>
						</div>
					)}

					{/* 口味選擇 */}
					{tempProduct.flavor && tempProduct.flavor.length > 0 && (
						<div className="product-flavor-section">
							<h3>選擇口味</h3>
							<div className="flavor-options">
								{tempProduct.flavor.map((flavor, i) => (
									<button
										key={i}
										className={`flavor-btn ${selectedFlavor === flavor ? "active" : ""}`}
										onClick={() => setSelectedFlavor(flavor)}
									>
										{flavor}
									</button>
								))}
							</div>
						</div>
					)}

					{/* 數量選擇 */}
					<div className="product-quantity-section">
						<h3>購買數量</h3>
						<div className="quantity-selector">
							<button
								className="qty-btn"
								onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
								disabled={quantity <= 1}
							>
								−
							</button>
							<span className="qty-value">{quantity}</span>
							<button
								className="qty-btn"
								onClick={() => setQuantity((prev) => Math.min(tempProduct.num || 99, prev + 1))}
								disabled={quantity >= (tempProduct.num || 99)}
							>
								+
							</button>
						</div>
						<span className="stock-info">
							庫存：{tempProduct.num} {tempProduct.unit}
						</span>
					</div>

					{/* 狀態與加入購物車 */}
					<div className="product-actions">
						{tempProduct.is_enabled === 1 ? (
							<>
								<button
									type="button"
									className="add-to-cart-btn"
									disabled={loading}
									onClick={() => handleAddCart(tempProduct.id)}
								>
									{loading ? (
										<>
											<span className="spinner"></span>
											加入購物車中...
										</>
									) : (
										<>
											<span className="cart-icon">🛒</span>
											加入購物車
										</>
									)}
								</button>
								<button
									type="button"
									className="buy-now-btn"
									disabled={loading}
									onClick={() => {
										handleAddCart(tempProduct.id).then(() => navigate("/cart"));
									}}
								>
									立即購買
								</button>
							</>
						) : (
							<div className="unavailable-notice">
								<span className="unavailable-icon">⚠️</span>
								此商品目前暫停販售
							</div>
						)}
					</div>

					{/* 額外資訊 */}
					<div className="product-extra-info">
						<div className="info-item">
							<span className="info-icon">🚚</span>
							<span>滿 $1000 免運費</span>
						</div>
						<div className="info-item">
							<span className="info-icon">🔄</span>
							<span>7 天鑑賞期</span>
						</div>
						<div className="info-item">
							<span className="info-icon">✅</span>
							<span>品質保證</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Product;
