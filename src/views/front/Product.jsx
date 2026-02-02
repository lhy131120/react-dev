import { api } from "../../api/axiosInstance.js";
import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useEffectEvent } from "react";
import { toast } from "react-toastify";

const Product = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const [tempProduct, setTempProduct] = useState(null);
	const [loading, setLoading] = useState(false);

	const getProduct = useEffectEvent(async () => {
		try {
			const response = await api.get(`/product/${id}`);
			const { product } = response.data;
			setTempProduct(product);
		} catch (error) {
			toast.error(`取得產品失敗: ${error.response?.data?.message}`, {
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				theme: "colored",
			});
			setTimeout(() => {
				navigate(`/products`);
			}, 1500);
		}
	});

	const handleAddCart = async (id, qty = 1) => {
		setLoading(true);
		const data = {
			product_id: id,
			qty,
		};
		try {
			const response = await api.post(`/cart`, { data });
			toast.success(`${response.data?.message || "成功加進購物車"}!`, {
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				theme: "colored",
			});
			setTimeout(() => {
				setLoading(false);
			}, 1500);
		} catch (error) {
			toast.error(`加入購物車失敗: ${error.response?.data?.message}`, {
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				theme: "colored",
			});
		}
	};

	useEffect(() => {
		getProduct();
	}, [id]);

	return (
		<>
			{tempProduct && <h2 className="fs-4 fw-bold text-primary mb-4">{tempProduct.title}</h2>}
			{tempProduct && (
				<div className="row row-cols-1 row-cols-lg-2 g-0 py-2 py-lg-3 bg-white">
					{/* 圖片區 */}
					<div className="col gx-3">
						{tempProduct?.imageUrl?.trim() && (
							<img
								src={tempProduct.imageUrl.trim()}
								alt={tempProduct.title}
								className="img-fluid rounded mb-2 mb-lg-3 shadow"
								style={{
									objectFit: "cover",
									width: "100%",
								}}
							/>
						)}
						{tempProduct.imagesUrl?.length > 0 && (
							<div className="d-flex gap-2 flex-wrap rounded overflow-hidden">
								{tempProduct.imagesUrl
									.filter((img) => img && img.trim() !== "")
									.map((img, i) => (
										<img
											key={i}
											src={img}
											alt={`additional-${i}`}
											className="shadow-sm"
											style={{
												width: "80px",
												height: "80px",
												objectFit: "cover",
											}}
											onError={(e) => {
												e.target.src = "https://via.placeholder.com/80?text=NoImage";
											}}
										/>
									))}
							</div>
						)}
					</div>

					{/* 資訊區 */}
					<div className="col gx-3">
						<p className="text-muted small mb-2">分類：{tempProduct.category}</p>
						<p className="text-muted small mb-2">類別：{tempProduct.subcategory}</p>

						{tempProduct.label && tempProduct.label.length > 0 && (
							<div className="d-flex flex-wrap gap-2 mb-2">
								{tempProduct.label.map((tag, i) => (
									<span key={i} className="badge bg-secondary">
										{tag}
									</span>
								))}
							</div>
						)}

						<div className="mb-3 text-muted">{tempProduct.description}</div>
						<div className="text-muted small">內容：{tempProduct.content}</div>

						<div className="my-4">
							<p className="text-decoration-line-through text-muted">
								原價：${tempProduct.origin_price} {tempProduct.unit}
							</p>
							<p className="fs-3 text-danger fw-bold">
								售價：${tempProduct.price} {tempProduct.unit}
							</p>
						</div>

						<div className="mb-2 text-muted">
							庫存：{tempProduct.num} {tempProduct.unit}
						</div>

						<div className="mb-2 text-muted">
							<div className="d-flex align-items-center">
								<span>口味:</span>
								{tempProduct.flavor && tempProduct.flavor.length > 0 && (
									<>
										{tempProduct.flavor.map((flavor, i) => (
											<span key={i} className="badge bg-secondary ms-2">
												{flavor}
											</span>
										))}
									</>
								)}
							</div>
						</div>

						<div className="mb-2">
							<p className="text-muted">
								狀態：
								<span className={`badge ms-2 ${tempProduct.is_enabled === 1 ? "bg-success" : "bg-secondary"}`}>
									{tempProduct.is_enabled === 1 ? "啟用" : "未啟用"}
								</span>
							</p>
						</div>

						<div>
							<button
								type="button"
								className={`btn btn-sm btn-primary fw-bold px-4 py-2 text-white d-flex align-items-center gap-1`}
								disabled={loading}
								onClick={() => handleAddCart(tempProduct.id)}
							>
								<span
									className={`spinner-border spinner-border-sm ${loading ? "d-block" : "d-none"}`}
									aria-hidden="true"
								></span>
								{loading ? "加入購物車中..." : "加入購物車"}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default Product;
