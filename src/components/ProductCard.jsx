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
				<img
					src={product.imageUrl}
					alt={product.title}
					className="card-img-top"
					style={{ objectFit: "cover", aspectRatio: "4 / 3"  }}
				/>
				<div className="card-body d-flex flex-column">
					<h2 className="fs-6 card-title fw-bold">{product.title}</h2>

					<div className="mt-1">
						<p className="fs-6 text-danger fw-bold mb-2">
							${product.price} / {product.unit}
						</p>
					</div>

					<button className="btn btn-primary mt-auto fw-bold" onClick={() => getProductDetails(product.id)}>
						<small>查看細節</small>
					</button>
				</div>
			</div>
		</div>
	);
};

export default ProductCard;
