// const ProductCard = ({ product, openModal }) => {
// 	return (
// 		<div className="col">
// 			<div className="card h-100 shadow-sm hover-shadow transition">
// 				<img
// 					src={product.imageUrl}
// 					alt={product.title}
// 					className="card-img-top"
// 					style={{ height: "200px", objectFit: "cover" }}
// 				/>
// 				<div className="card-body d-flex flex-column">
// 					<h2 className="fs-6 card-title fw-bold">{product.title}</h2>

// 					<div className="mt-1">
// 						<p className="fs-6 text-danger fw-bold mb-2">
// 							${product.price} / {product.unit}
// 						</p>
// 					</div>

// 					<button className="btn btn-primary mt-auto fw-bold" onClick={() => openModal("product", product)}>
// 						<small>查看細節</small>
// 					</button>
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

const ProductCard = ({ product, getProductDetails }) => {
	return (
		<div className="col">
			<div className="card h-100 shadow-sm hover-shadow transition">
				<div style={{ position: 'relative', overflow: 'hidden', height: '220px' }}>
					<img
						src={product.imageUrl}
						alt={product.title}
						className="card-img-top"
						style={{ 
							width: '100%',
							height: '100%',
							objectFit: "cover",
							aspectRatio: "4 / 3"  
						}}
					/>
					{product.is_enabled === 1 && (
						<span 
							className="badge bg-primary" 
							style={{
								position: 'absolute',
								top: '10px',
								right: '10px',
								fontSize: '0.8rem',
								padding: '0.5rem 0.8rem'
							}}
						>
							熱銷
						</span>
					)}
				</div>
				<div className="card-body d-flex flex-column">
					<h2 className="fs-6 card-title fw-bold mb-2">{product.title}</h2>
					
					{product.description && (
						<p 
							className="text-muted small mb-2" 
							style={{ 
								color: '#92400e',
								opacity: 0.7,
								minHeight: '40px'
							}}
						>
							{product.description.substring(0, 60)}...
						</p>
					)}

					<div className="mt-auto">
						<p className="fs-6 fw-bold mb-3" style={{ color: '#d97706' }}>
							NT${product.price} / {product.unit}
						</p>
						{product.origin_price && product.origin_price > product.price && (
							<p className="text-decoration-line-through small" style={{ color: '#999' }}>
								原價: NT${product.origin_price}
							</p>
						)}
					</div>

					<button 
						className="btn btn-primary mt-3 fw-bold w-100" 
						onClick={() => getProductDetails(product.id)}
					>
						查看詳細
					</button>
				</div>
			</div>
		</div>
	);
};

export default ProductCard;
