// components/ProductDetailModal.jsx
import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Modal } from "bootstrap";

const ProductDetailModal = forwardRef(({ tempProduct, onClose }, ref) => {
	const modalEl = useRef(null);
	const modalInstance = useRef(null);

	useEffect(() => {
		if (!modalEl.current) return;

		modalInstance.current = new Modal(modalEl.current, {
			keyboard: false,
			backdrop: "static",
		});

		return () => {
			modalInstance.current?.dispose();
		};
	}, []);

	useImperativeHandle(ref, () => ({
		show: () => modalInstance.current?.show(),
		hide: () => modalInstance.current?.hide(),
	}));

	return (
		<div className="modal fade" ref={modalEl} tabIndex="-1">
			<div className="modal-dialog modal-dialog-centered modal-lg">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">{tempProduct?.title || "產品資訊"}</h5>
						<button type="button" className="btn-close" onClick={onClose}></button>
					</div>
					<div className="modal-body">
						{tempProduct && (
							<div className="row g-4">
								{/* 圖片區 */}
								<div className="col-md-6">
									{tempProduct?.imageUrl?.trim() && (
										<img
											src={tempProduct.imageUrl.trim()}
											alt={tempProduct.title}
											className="img-fluid rounded mb-3 shadow"
											style={{
												height: "350px",
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
								<div className="col-md-6">
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

									<div className="mb-3">{tempProduct.description}</div>
									<div className="text-muted small">內容：{tempProduct.content}</div>

									<div className="my-4">
										<p className="text-decoration-line-through text-muted">
											原價：${tempProduct.origin_price} {tempProduct.unit}
										</p>
										<p className="fs-3 text-danger fw-bold">
											售價：${tempProduct.price} {tempProduct.unit}
										</p>
									</div>

									<div className="mb-2">
										庫存：{tempProduct.num} {tempProduct.unit}
									</div>
									<div className="mb-2">
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
									<p>
										狀態：
										<span className={`badge ms-2 ${tempProduct.is_enabled === 1 ? "bg-success" : "bg-secondary"}`}>
											{tempProduct.is_enabled === 1 ? "啟用" : "未啟用"}
										</span>
									</p>
								</div>
							</div>
						)}
					</div>
					<div className="modal-footer">
						<button type="button" className="btn btn-secondary" onClick={onClose}>
							關閉
						</button>
					</div>
				</div>
			</div>
		</div>
	);
});

export default ProductDetailModal;
