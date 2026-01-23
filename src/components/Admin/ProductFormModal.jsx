// components/Admin/ProductFormModal.jsx
import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Modal } from "bootstrap";

const ProductFormModal = forwardRef(
	(
		{
			tempProduct,
			setTempProduct,
			formErrors,
			handleModalInputChange,
			updateProduct,
			closeModal,
			uploadingImages,
			setUploadingImages,
			previewImage,
			setPreviewImage,
			selectedFile,
			setSelectedFile,
			isUploading,
			uploadImageInputRef,
			uploadImage,
			handleUploadImage,
		},
		ref
	) => {
		const modalEl = useRef(null);
		const modalInstance = useRef(null);

		// 初始化與銷毀 Bootstrap Modal
		useEffect(() => {
			if (!modalEl.current) return;

			modalInstance.current = new Modal(modalEl.current, {
				keyboard: true,
				backdrop: true,
			});

			const handleShown = () => {
				modalEl.current.removeAttribute("aria-hidden");
				modalEl.current.inert = false;
				const firstFocusable = modalEl.current.querySelector(
					".btn-close, input:not([disabled]), textarea:not([disabled]), button:not([disabled])"
				);
				firstFocusable?.focus();
			};

			const handleHide = () => {
				modalEl.current?.removeAttribute("inert");
			};

			// 綁定 Bootstrap 事件
			modalEl.current.addEventListener("shown.bs.modal", handleShown);
			modalEl.current.addEventListener("hide.bs.modal", handleHide);
			modalEl.current.addEventListener("hidden.bs.modal", handleHide);

			// Cleanup：移除事件監聽 + 銷毀 Modal 實例
			return () => {
				modalInstance.current?.dispose();
				modalEl.current.removeEventListener("shown.bs.modal", handleShown);
				modalEl.current.removeEventListener("hide.bs.modal", handleHide);
				modalEl.current.removeEventListener("hidden.bs.modal", handleHide);
			};
		}, []);

		useImperativeHandle(ref, () => ({
			show: () => modalInstance.current?.show(),
			hide: () => modalInstance.current?.hide(),
		}));

		// 根據是否有 id 判斷是「編輯」還是「新增」
		const modalTitle = tempProduct?.id ? "編輯產品" : "新增產品";

		return (
			<div className="modal fade" ref={modalEl} tabIndex="-1">
				<div className="modal-dialog modal-dialog-centered modal-xl modal-fullscreen-xl-down modal-dialog-scrollable">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title">{tempProduct?.title || modalTitle}</h5>
							<button
								type="button"
								className="btn-close"
								onClick={() => closeModal(tempProduct?.id ? "edit" : "newItem")}
							/>
						</div>

						<div className="modal-body">
							{tempProduct && (
								<div className="row flex-row-reverse g-4">
									{/* 左側：主要表單欄位 */}
									<div className="col-lg-8">
										{/* 標題 */}
										<div className="mb-3">
											<label htmlFor="title" className="form-label">
												標題 <span className="text-danger">*</span>
											</label>
											<input
												id="title"
												type="text"
												className={`form-control ${formErrors.title ? "is-invalid" : ""}`}
												placeholder="請輸入標題"
												value={tempProduct.title || ""}
												onChange={handleModalInputChange}
											/>
											{formErrors.title && <div className="invalid-feedback">{formErrors.title}</div>}
										</div>

										{/* 主分類 + 次分類 + 單位 */}
										<div className="row">
											<div className="mb-3 col-lg-5">
												<label htmlFor="category" className="form-label">
													主分類 <span className="text-danger">*</span>
												</label>
												<input
													id="category"
													type="text"
													className={`form-control ${formErrors.category ? "is-invalid" : ""}`}
													placeholder="請輸入主分類"
													value={tempProduct.category ?? ""}
													onChange={handleModalInputChange}
												/>
												{formErrors.category && <div className="invalid-feedback">{formErrors.category}</div>}
											</div>

											<div className="mb-3 col-lg-5">
												<label htmlFor="subcategory" className="form-label">
													次分類 <span className="text-danger">*</span>
												</label>
												<input
													id="subcategory"
													type="text"
													className={`form-control ${formErrors.subcategory ? "is-invalid" : ""}`}
													placeholder="請輸入次分類"
													value={tempProduct.subcategory ?? ""}
													onChange={handleModalInputChange}
												/>
												{formErrors.subcategory && <div className="invalid-feedback">{formErrors.subcategory}</div>}
											</div>

											<div className="mb-3 col-lg-2">
												<label htmlFor="unit" className="form-label">
													單位 <span className="text-danger">*</span>
												</label>
												<input
													id="unit"
													type="text"
													className={`form-control ${formErrors.unit ? "is-invalid" : ""}`}
													placeholder="單位"
													value={tempProduct.unit ?? ""}
													onChange={handleModalInputChange}
												/>
												{formErrors.unit && <div className="invalid-feedback">{formErrors.unit}</div>}
											</div>
										</div>

										{/* 原價 + 售價 + 庫存 */}
										<div className="row">
											<div className="mb-3 col-lg-5">
												<label htmlFor="origin_price" className="form-label">
													原價 <span className="text-danger">*</span>
												</label>
												<input
													id="origin_price"
													type="number"
													min="1"
													className={`form-control ${formErrors.origin_price ? "is-invalid" : ""}`}
													placeholder="請輸入原價"
													value={tempProduct.origin_price ?? ""}
													onChange={handleModalInputChange}
												/>
												{formErrors.origin_price && <div className="invalid-feedback">{formErrors.origin_price}</div>}
											</div>

											<div className="mb-3 col-lg-5">
												<label htmlFor="price" className="form-label">
													售價 <span className="text-danger">*</span>
												</label>
												<input
													id="price"
													type="number"
													min="1"
													className={`form-control ${formErrors.price ? "is-invalid" : ""}`}
													placeholder="請輸入售價"
													value={tempProduct.price ?? ""}
													onChange={handleModalInputChange}
												/>
												{formErrors.price && <div className="invalid-feedback">{formErrors.price}</div>}
											</div>

											<div className="mb-3 col-lg-2">
												<label htmlFor="num" className="form-label">
													庫存 <span className="text-danger">*</span>
												</label>
												<input
													id="num"
													type="text"
													className={`form-control ${formErrors.num ? "is-invalid" : ""}`}
													placeholder="庫存"
													value={tempProduct.num ?? ""}
													onChange={handleModalInputChange}
												/>
												{formErrors.num && <div className="invalid-feedback">{formErrors.num}</div>}
											</div>
										</div>

										<hr />

										{/* 產品描述 */}
										<div className="mb-3">
											<label htmlFor="description" className="form-label">
												產品描述 <span className="text-danger">*</span>
											</label>
											<textarea
												rows={6}
												id="description"
												className={`form-control ${formErrors.description ? "is-invalid" : ""}`}
												placeholder="請輸入產品描述"
												value={tempProduct.description || ""}
												onChange={handleModalInputChange}
											/>
										</div>

										{/* 說明內容 */}
										<div className="mb-3">
											<label htmlFor="content" className="form-label">
												說明內容 <span className="text-danger">*</span>
											</label>
											<textarea
												rows={6}
												id="content"
												className={`form-control ${formErrors.content ? "is-invalid" : ""}`}
												placeholder="請輸入說明內容"
												value={tempProduct.content || ""}
												onChange={handleModalInputChange}
											/>
										</div>

										{/* 是否啟用 */}
										<div className="mb-3">
											<div className="form-check">
												<input
													id="is_enabled"
													className="form-check-input p-0"
													type="checkbox"
													checked={tempProduct.is_enabled === 1}
													onChange={handleModalInputChange}
												/>
												<label className="form-check-label" htmlFor="is_enabled">
													是否啟用
												</label>
											</div>
										</div>

										{/* 標籤管理 */}
										<div className="mb-3">
											<p className="form-label fw-bold">標籤（可多個，建議輸入關鍵字）</p>

											<div className="d-flex flex-column gap-2">
												{tempProduct?.label?.map((tag, index) => (
													<div key={index} className="input-group">
														<input
															type="text"
															className="form-control"
															value={tag}
															onChange={(e) => {
																const newTags = [...tempProduct.label];
																newTags[index] = e.target.value.trim();
																setTempProduct((prev) => ({
																	...prev,
																	label: newTags,
																}));
															}}
															placeholder={`${index + 1} (例如：熱銷、限時)`}
														/>
														<button
															className="btn btn-outline-danger"
															type="button"
															onClick={() => {
																const newTags = tempProduct.label.filter((_, i) => i !== index);
																setTempProduct((prev) => ({
																	...prev,
																	label: newTags,
																}));
															}}
														>
															移除
														</button>
													</div>
												))}

												<button
													type="button"
													className={`btn btn-outline-primary ${tempProduct?.label?.length >= 3 ? "d-none" : ""}`}
													onClick={() => {
														const newTags = [...(tempProduct?.label || []), ""];
														setTempProduct((prev) => ({
															...prev,
															label: newTags,
														}));
													}}
												>
													+ 新增標籤
												</button>
											</div>

											{tempProduct?.label?.length > 0 && (
												<div className="mt-3">
													<small className="text-muted">目前標籤預覽：</small>
													<div className="d-flex flex-wrap gap-2 mt-1">
														{tempProduct.label.map(
															(tag, i) =>
																tag?.trim() && (
																	<span key={i} className="badge bg-info text-white">
																		{tag.trim()}
																	</span>
																)
														)}
													</div>
												</div>
											)}
										</div>

										{/* 口味管理 */}
										<div className="mb-3">
											<p className="form-label fw-bold">可選口味（可加入）</p>

											<div className="d-flex flex-column gap-2">
												{tempProduct?.flavor?.map((flavor, index) => (
													<div key={index} className="input-group">
														<input
															type="text"
															className="form-control"
															value={flavor}
															onChange={(e) => {
																const newFlavors = [...tempProduct.flavor];
																newFlavors[index] = e.target.value.trim();
																setTempProduct((prev) => ({
																	...prev,
																	flavor: newFlavors,
																}));
															}}
															placeholder={`${index + 1} (例如：小辣、辛辣)`}
														/>
														<button
															className="btn btn-outline-danger"
															type="button"
															onClick={() => {
																const newFlavors = tempProduct.flavor.filter((_, i) => i !== index);
																setTempProduct((prev) => ({
																	...prev,
																	flavor: newFlavors,
																}));
															}}
														>
															移除
														</button>
													</div>
												))}

												<button
													type="button"
													className={`btn btn-outline-primary ${tempProduct?.flavor?.length >= 2 ? "d-none" : ""}`}
													onClick={() => {
														const newFlavors = [...(tempProduct?.flavor || []), ""];
														setTempProduct((prev) => ({
															...prev,
															flavor: newFlavors,
														}));
													}}
												>
													+ 新增口味
												</button>
											</div>

											{tempProduct?.flavor?.length > 0 && (
												<div className="mt-3">
													<small className="text-muted">目前口味預覽：</small>
													<div className="d-flex flex-wrap gap-2 mt-1">
														{tempProduct.flavor.map(
															(flavor, i) =>
																flavor?.trim() && (
																	<span key={i} className="badge bg-info text-white">
																		{flavor.trim()}
																	</span>
																)
														)}
													</div>
												</div>
											)}
										</div>
									</div>

									{/* 右側：圖片管理區 */}
									<div className="col-lg-4">
										{/* 主要圖片 */}
										<div className="mb-4">
											<label htmlFor="imageUrl" className="form-label fw-bold">
												主要圖片網址 <span className="text-danger">*</span>
											</label>
											<input
												id="imageUrl"
												type="url"
												className="form-control mb-2"
												placeholder="https://example.com/main.jpg"
												value={tempProduct.imageUrl || ""}
												onChange={handleModalInputChange}
											/>

											{tempProduct.imageUrl?.trim() && (
												<div className="mt-2 border rounded overflow-hidden">
													<img
														src={tempProduct.imageUrl.trim()}
														alt="主要圖片預覽"
														className="img-fluid"
														style={{
															maxHeight: "250px",
															objectFit: "cover",
															width: "100%",
														}}
														onError={(e) => {
															e.target.src = "https://dummyimage.com/600x400/000/fff&text=dummy";
														}}
													/>
												</div>
											)}

											{/* 單張圖片上傳區域 */}
											<div className="mt-2">
												<div className="input-group flex-nowrap">
													<input
														type="file"
														className="form-control"
														id="uploadImageInput"
														name="file-to-upload"
														ref={uploadImageInputRef}
														aria-describedby="uploadImageButton"
														aria-label="Upload"
													/>
													<button
														className="btn btn-outline-secondary"
														type="button"
														id="uploadImageButton"
														onClick={uploadImage}
													>
														上傳
													</button>
												</div>
											</div>
										</div>

										{/* 多張附加圖片管理 */}
										<div>
											<p className="fw-bold mb-3">附加圖片（可多張，上傳後自動加入）</p>

											{tempProduct?.imagesUrl?.map((url, index) => (
												<div key={index} className="input-group mb-3 align-items-center position-relative">
													<div className="form-control bg-dark text-white border-0 d-flex align-items-center gap-2 p-2">
														<img
															src={url}
															alt={`附加圖片 ${index + 1}`}
															className="rounded"
															style={{
																width: "60px",
																height: "60px",
																objectFit: "cover",
															}}
															onError={(e) => {
																e.target.src = "https://via.placeholder.com/60?text=錯誤";
															}}
														/>
														<small className="text-truncate flex-grow-1">{url}</small>
													</div>
													<button
														className="btn btn-danger position-absolute top-0 end-0 z-1 d-flex justify-content-center align-items-center"
														style={{
															width: "24px",
															height: "24px",
															padding: 0,
														}}
														type="button"
														onClick={() => {
															const newImages = tempProduct.imagesUrl.filter((_, i) => i !== index);
															setTempProduct((prev) => ({
																...prev,
																imagesUrl: newImages,
															}));
														}}
													>
														×
													</button>
												</div>
											))}

											<button
												type="button"
												className="btn btn-outline-primary w-100 mb-3"
												onClick={() => setUploadingImages(true)}
											>
												+ 上傳新圖片
											</button>

											{/* 上傳新附加圖片的區域（點擊後展開） */}
											{uploadingImages && (
												<div className="border border-primary rounded p-3 mb-3 bg-dark bg-opacity-50">
													<div className="d-flex justify-content-between align-items-center mb-2">
														<label className="form-label mb-0 text-white">選擇圖片上傳</label>
														<button
															type="button"
															className="btn btn-sm btn-outline-secondary text-white"
															onClick={() => setUploadingImages(false)}
														>
															取消
														</button>
													</div>

													<div className="input-group mb-2">
														<input
															type="file"
															className="form-control"
															accept="image/*"
															ref={uploadImageInputRef}
															onChange={(e) => {
																const file = e.target.files?.[0];
																if (file) {
																	const previewUrl = URL.createObjectURL(file);
																	setPreviewImage(previewUrl);
																	setSelectedFile(file);
																}
															}}
														/>
													</div>

													{previewImage && (
														<div className="mt-2 text-center">
															<img
																src={previewImage}
																alt="預覽"
																className="rounded shadow-sm"
																style={{
																	maxHeight: "180px",
																	maxWidth: "100%",
																	objectFit: "contain",
																}}
															/>
															<small className="d-block text-muted mt-1">
																{selectedFile?.name} ({(selectedFile?.size / 1024 / 1024).toFixed(2)} MB)
															</small>
														</div>
													)}

													<button
														type="button"
														className="btn btn-primary w-100 mt-3"
														disabled={!selectedFile || isUploading}
														onClick={handleUploadImage}
													>
														{isUploading ? (
															<>
																<span
																	className="spinner-border spinner-border-sm me-2"
																	role="status"
																	aria-hidden="true"
																></span>
																上傳中...
															</>
														) : (
															"確認上傳"
														)}
													</button>
												</div>
											)}
										</div>
									</div>
								</div>
							)}
						</div>

						<div className="modal-footer">
							<button type="button" className="btn btn-secondary" onClick={updateProduct}>
								確定
							</button>
							<button
								type="button"
								className="btn btn-danger"
								onClick={() => closeModal(tempProduct?.id ? "edit" : "newItem")}
							>
								關閉
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
);

export default ProductFormModal;
