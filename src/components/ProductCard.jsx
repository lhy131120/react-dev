import "@/styles/ProductCard.css";

const ProductCard = ({ product, getProductDetails }) => {
	const discountPercent = product.origin_price && product.origin_price > product.price
		? Math.round(((product.origin_price - product.price) / product.origin_price) * 100)
		: 0;

	return (
		<div className="col">
			<div className="product-card-wrapper" onClick={() => getProductDetails(product.id)}>
				{/* 圖片區域 */}
				<div className="product-card-image">
					<img
						src={product.imageUrl}
						alt={product.title}
						onError={(e) => {
							e.target.src = "https://placehold.co/400x300?text=No+Image";
						}}
					/>
					
					{/* 浮動標籤 */}
					<div className="product-card-badges">
						{product.is_enabled === 1 && (
							<span className="badge-hot">🔥 熱銷</span>
						)}
						{discountPercent > 0 && (
							<span className="badge-discount">-{discountPercent}%</span>
						)}
					</div>

					{/* Hover 遮罩 */}
					<div className="product-card-overlay">
						<span className="view-detail-btn">
							<span className="btn-icon">👁️</span>
							查看詳細
						</span>
					</div>
				</div>

				{/* 資訊區域 */}
				<div className="product-card-content">
					{/* 分類標籤 */}
					<span className="product-card-category">{product.category}</span>
					
					{/* 標題 */}
					<h3 className="product-card-title">{product.title}</h3>
					
					{/* 描述 */}
					{product.description && (
						<p className="product-card-desc">
							{product.description.length > 50 
								? product.description.substring(0, 50) + "..." 
								: product.description}
						</p>
					)}

					{/* 價格區域 */}
					<div className="product-card-price-section">
						<div className="price-wrapper">
							<span className="current-price">NT${product.price}</span>
							<span className="price-unit">/ {product.unit}</span>
						</div>
						{product.origin_price && product.origin_price > product.price && (
							<span className="original-price">NT${product.origin_price}</span>
						)}
					</div>

					{/* 底部操作區 */}
					<div className="product-card-footer">
						<button className="add-to-cart-btn">
							<span>🛒</span> 加入購物車
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProductCard;
