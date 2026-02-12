import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProducts } from "@/store/productsSlice";
import { useNavigate, Link } from "react-router";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { toast } from "react-toastify";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "@/styles/Swiper.css";
import "@/styles/Home.css";

// 數字動畫 hook
const useCountUp = (target, duration = 2000, start = false) => {
	const [count, setCount] = useState(0);

	useEffect(() => {
		if (!start) return;
		let startTime = null;
		const step = (timestamp) => {
			if (!startTime) startTime = timestamp;
			const progress = Math.min((timestamp - startTime) / duration, 1);
			// ease-out cubic
			const eased = 1 - Math.pow(1 - progress, 3);
			setCount(Math.floor(eased * target));
			if (progress < 1) requestAnimationFrame(step);
		};
		requestAnimationFrame(step);
	}, [target, duration, start]);

	return count;
};

// Intersection Observer hook
const useInView = (threshold = 0.2) => {
	const ref = useRef(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				setIsVisible(true);
				observer.unobserve(entry.target);
			}
		}, { threshold });

		const current = ref.current;
		if (current) observer.observe(current);
		return () => { if (current) observer.unobserve(current); };
	}, [threshold]);

	return [ref, isVisible];
};

const FLOATING_SPICES = ["🌶️", "🧄", "🫚", "🌿", "🧂", "🍋", "🫒", "🌰"];

const FEATURES = [
	{ icon: "🌍", iconClass: "feature-icon-globe", title: "全球嚴選", desc: "精選來自 30+ 國家的頂級香料，從印度到墨西哥，風味直送您的廚房" },
	{ icon: "🌿", iconClass: "feature-icon-leaf", title: "天然有機", desc: "100% 天然無添加，通過國際有機認證，讓您安心享用每一口" },
	{ icon: "🚚", iconClass: "feature-icon-truck", title: "新鮮直達", desc: "全程冷鏈保鮮配送，下單後 48 小時內送達，鎖住最佳風味" },
	{ icon: "⭐", iconClass: "feature-icon-star", title: "品質保證", desc: "嚴格品控流程，超過 10,000+ 位主廚信賴推薦的調味料品牌" },
];

const MARQUEE_TAGS = [
	"🌶️ 辣椒粉", "🧄 蒜頭醬", "🫚 薑黃粉", "🌿 羅勒葉", "🧂 喜馬拉雅粉鹽",
	"🍋 檸檬胡椒", "🫒 初榨橄欖油", "🌰 肉桂粉", "🫑 煙燻辣椒", "🍯 蜂蜜芥末",
	"🧅 洋蔥粉", "🌶️ 卡宴辣椒", "🥥 椰子油", "🍃 迷迭香", "☘️ 奧勒岡",
	"🌶️ 辣椒粉", "🧄 蒜頭醬", "🫚 薑黃粉", "🌿 羅勒葉", "🧂 喜馬拉雅粉鹽",
	"🍋 檸檬胡椒", "🫒 初榨橄欖油", "🌰 肉桂粉", "🫑 煙燻辣椒", "🍯 蜂蜜芥末",
	"🧅 洋蔥粉", "🌶️ 卡宴辣椒", "🥥 椰子油", "🍃 迷迭香", "☘️ 奧勒岡",
];

// Swiper 設定常量（避免每次渲染建立新物件參考）
const SWIPER_MODULES = [Navigation, Pagination, Autoplay];
const SWIPER_PAGINATION = { clickable: true, dynamicBullets: true };
const SWIPER_AUTOPLAY = { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true };

const handleImgError = (e) => {
	e.target.src = "https://placehold.co/300x200?text=No+Image";
};

// memo 化產品卡片，props 不變時跳過重新渲染
const ProductCard = memo(({ product, onNavigate }) => (
	<div
		className="product-card"
		onClick={() => onNavigate(product.id)}
		style={{ cursor: "pointer" }}
	>
		<img
			src={product.imageUrl}
			alt={product.title}
			className="product-image"
			onError={handleImgError}
		/>
		<div className="product-info">
			<h5 className="product-title">{product.title}</h5>
			<span className="product-category">{product.category}</span>
			{product.description && <p className="product-description">{product.description}</p>}
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
		<div style={{ marginTop: "auto", paddingTop: "0.5rem" }}>
			<span className={`badge ${product.is_enabled === 1 ? "bg-success" : "bg-secondary"}`}>
				{product.is_enabled === 1 ? "啟用" : "未啟用"}
			</span>
		</div>
	</div>
));
ProductCard.displayName = "ProductCard";

// memo 化產品輪播區，隔離 useCountUp 動畫造成的高頻重渲染
const ProductSwiper = memo(({ products, onNavigate }) => {
	if (products.length === 0) {
		return (
			<div className="swiper-empty-state">
				<p className="swiper-empty-text">暫無產品</p>
			</div>
		);
	}
	return (
		<div className="swiper-container">
			<Swiper
				modules={SWIPER_MODULES}
				grabCursor={true}
				pagination={SWIPER_PAGINATION}
				navigation={true}
				autoplay={SWIPER_AUTOPLAY}
				speed={600}
				loop={true}
				slidesPerView="auto"
				centeredSlides={true}
				className="product-swiper"
			>
				{products.map((product) => (
					<SwiperSlide key={product.id}>
						<ProductCard product={product} onNavigate={onNavigate} />
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	);
});
ProductSwiper.displayName = "ProductSwiper";

const Home = () => {
	const dispatch = useDispatch();
	const products = useSelector((state) => state.products.products);
	const navigate = useNavigate();
	const handleNavigate = useCallback((id) => navigate(`/product/${id}`), [navigate]);

	// Intersection Observer refs
	const [statsRef, statsVisible] = useInView();
	const [featuresRef, featuresVisible] = useInView();
	const [carouselRef, carouselVisible] = useInView();

	// 數字動畫
	const countProducts = useCountUp(150, 2000, statsVisible);
	const countCountries = useCountUp(30, 1800, statsVisible);
	const countChefs = useCountUp(10000, 2200, statsVisible);
	const countYears = useCountUp(12, 1500, statsVisible);

	useEffect(() => {
		if (products.length === 0) {
			dispatch(fetchProducts())
				.unwrap()
				.catch((msg) => toast.error(`取得產品列表失敗: ${msg}`));
		}
	}, [dispatch, products.length]);

	return (
		<>
			{/* ===== Hero Banner ===== */}
			<section className="hero-banner">
				{/* 浮動調料裝飾 */}
				<div className="hero-floating-elements">
					{FLOATING_SPICES.map((spice, i) => (
						<span className="hero-float-item" key={i}>{spice}</span>
					))}
				</div>

				{/* 主要內容 */}
				<div className="hero-content">
					<div className="hero-badge">
						<span className="hero-badge-dot" />
						全新到貨 — 2026 春季限定系列
					</div>

					<h1 className="hero-title">
						探索世界級的
						<br />
						<span className="hero-title-highlight">異域調味料</span>
					</h1>

					<p className="hero-subtitle">
						嚴選來自全球 30+ 國家的頂級天然調味料，為您的每一道料理注入靈魂。從東京到墨西哥城，風味環遊世界。
					</p>

					<div className="hero-actions">
						<Link to="/products" className="hero-btn-primary">
							🔥 立即探索商品
						</Link>
						<Link to="/products" className="hero-btn-secondary">
							查看本季推薦
						</Link>
					</div>
				</div>

				{/* 滾動提示 */}
				{/* <div className="hero-scroll-indicator">
					<div className="scroll-mouse" />
					SCROLL
				</div> */}
			</section>

			{/* ===== 數據統計 ===== */}
			<div className="stats-bar" ref={statsRef}>
				{[
					{ icon: "🌶️", number: countProducts, suffix: "+", label: "優質商品" },
					{ icon: "🌍", number: countCountries, suffix: "+", label: "國家直送" },
					{ icon: "👨‍🍳", number: countChefs, suffix: "+", label: "主廚信賴" },
					{ icon: "📦", number: countYears, suffix: " 年", label: "品牌歷史" },
				].map((stat, i) => (
					<div
						className={`stat-item ${statsVisible ? "visible" : ""}`}
						key={i}
						style={{ transitionDelay: `${i * 0.05}s` }}
					>
						<span className="stat-icon">{stat.icon}</span>
						<span className="stat-number">{stat.number}{stat.suffix}</span>
						<span className="stat-label">{stat.label}</span>
					</div>
				))}
			</div>

			{/* ===== 特色亮點 ===== */}
			<section className="features-section" ref={featuresRef}>
				<div className="section-header">
					<span className="section-tag">Why Choose Us</span>
					<h2 className="section-title">為什麼選擇我們？</h2>
					<p className="section-desc">我們對品質的堅持，讓每一瓶調味料都成為您料理的秘密武器</p>
				</div>
				<div className="features-grid">
					{FEATURES.map((feature, i) => (
						<div
							className={`feature-card ${featuresVisible ? "visible" : ""}`}
							key={i}
							style={{ transitionDelay: `${i * 0.15}s` }}
						>
							<div className={`feature-icon ${feature.iconClass}`}>{feature.icon}</div>
							<h3 className="feature-title">{feature.title}</h3>
							<p className="feature-desc">{feature.desc}</p>
						</div>
					))}
				</div>
			</section>

			{/* ===== 分類跑馬燈 ===== */}
			<div className="marquee-section">
				<div className="marquee-track">
					{MARQUEE_TAGS.map((tag, i) => (
						<span className="marquee-tag" key={i}>{tag}</span>
					))}
				</div>
			</div>

			{/* ===== 產品 Swiper ===== */}
			<section className="carousel-section" ref={carouselRef}>
				<div className={`swiper-page-header text-center ${carouselVisible ? "visible" : ""}`}>
					<span className="section-tag">Best Sellers</span>
					<h2 className="swiper-page-title">🌶️ 人氣熱銷商品</h2>
					<p className="swiper-page-subtitle">最受歡迎的調味料精選，每一款都經過千位美食愛好者的嚴格考驗</p>
				</div>

				<ProductSwiper products={products} onNavigate={handleNavigate} />
			</section>

			{/* ===== CTA 行動呼籲 ===== */}
			<section className="cta-banner">
				<span className="cta-float">🌶️</span>
				<span className="cta-float">🧄</span>
				<span className="cta-float">🌿</span>
				<span className="cta-float">🍋</span>
				<div className="cta-content">
					<h2 className="cta-title">準備好提升您的料理功力了嗎？</h2>
					<p className="cta-desc">加入超過 10,000 位美食愛好者的行列，開啟您的調味料探索之旅</p>
					<Link to="/products" className="cta-btn">
						開始購物 <span className="cta-btn-arrow">→</span>
					</Link>
				</div>
			</section>
		</>
	);
};

export default Home;
