import ProductCard from "./ProductCard";

const ProductList = ({ products, openModal, showAdminDashboard }) => {
	return (
		<div>
			<div className="d-flex mb-5 justify-content-between align-items-center">
				<h1 className="fs-4 fw-bold text-primary mb-0">產品列表</h1>
				<button type="button" className="btn btn-primary" onClick={showAdminDashboard}>
					前住儀表板
				</button>
			</div>
			{products.length === 0 ? (
				<h2 className="text-center py-5 text-white">目前沒有產品資料...</h2>
			) : (
				<div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4 mb-5">
					{products.map((item) => (
						<ProductCard key={item.id} product={item} openModal={openModal} />
					))}
				</div>
			)}
		</div>
	);
};

export default ProductList;
