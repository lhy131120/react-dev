// components/Admin/ProductFormModal.jsx
import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "@/services";
import { toast } from "react-toastify";

const ProductFormModal = forwardRef(({ tempProduct, onSave, closeModal }, ref) => {
	const modalEl = useRef(null);
	const [showModal, setShowModal] = useState(false);

	// 圖片上傳 states（元件內部管理）
	const [uploadingImages, setUploadingImages] = useState(false);
	const [previewImage, setPreviewImage] = useState(null);
	const [selectedFile, setSelectedFile] = useState(null);
	const [isUploading, setIsUploading] = useState(false);
	const mainImageInputRef = useRef(null);
	const uploadImageInputRef = useRef(null);

	const {
		register,
		handleSubmit,
		reset,
		watch,
		setValue,
		getValues,
		formState: { errors },
	} = useForm({ mode: "onTouched" });

	// Watch fields for reactive rendering
	const labels = watch("label", []);
	const flavors = watch("flavor", []);
	const imagesUrl = watch("imagesUrl", []);
	const imageUrl = watch("imageUrl", "");
	const watchTitle = watch("title", "");

	useImperativeHandle(ref, () => ({
		show: () => {
			setShowModal(true);
			document.body.classList.add("modal-open");
		},
		hide: () => {
			setShowModal(false);
			document.body.classList.remove("modal-open");
		},
	}));

	// 當 tempProduct 變更時 reset 表單
	useEffect(() => {
		if (tempProduct) {
			reset({
				...tempProduct,
				is_enabled: tempProduct.is_enabled === 1,
			});
		}
	}, [tempProduct, reset]);

	// 關閉時清理上傳狀態
	useEffect(() => {
		if (!showModal) {
			document.body.classList.remove("modal-open");
			setUploadingImages(false);
			setPreviewImage(null);
			setSelectedFile(null);
			setIsUploading(false);
			if (mainImageInputRef.current) mainImageInputRef.current.value = "";
			if (uploadImageInputRef.current) uploadImageInputRef.current.value = "";
		}
	}, [showModal]);

	const modalTitle = tempProduct?.id ? "編輯產品" : "新增產品";

	// ── Form Submit ──
	const onFormSubmit = (data) => {
		onSave({
			...data,
			id: tempProduct?.id,
			label: (getValues("label") || []).filter((t) => t?.trim()),
			flavor: (getValues("flavor") || []).filter((f) => f?.trim()),
			imagesUrl: getValues("imagesUrl") || [],
			is_enabled: data.is_enabled ? 1 : 0,
		});
	};

	// ── 主圖上傳 ──
	const uploadMainImage = async () => {
		try {
			const file = mainImageInputRef.current?.files[0];
			if (!file) return;
			const formData = new FormData();
			formData.append("file-to-upload", file);
			const response = await api.post("/admin/upload", formData);
			setValue("imageUrl", response.data.imageUrl, { shouldValidate: true, shouldDirty: true });
		} catch (error) {
			toast.error(`${error?.response?.data?.message}` || "上傳圖片失敗");
		}
	};

	// ── 附加圖片上傳 ──
	const handleUploadImage = async () => {
		if (!selectedFile) return;
		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.append("file-to-upload", selectedFile);
			const response = await api.post("/admin/upload", formData);
			const current = getValues("imagesUrl") || [];
			setValue("imagesUrl", [...current, response.data.imageUrl], { shouldDirty: true });
			toast.success("圖片上傳成功！");
		} catch (error) {
			toast.error(`${error?.response?.data?.message}` || "上傳圖片失敗");
		} finally {
			setUploadingImages(false);
			setPreviewImage(null);
			setSelectedFile(null);
			setIsUploading(false);
			if (uploadImageInputRef.current) uploadImageInputRef.current.value = "";
		}
	};

	if (!showModal) return null;

	return (
		<>
			{/* Backdrop */}
			<div className="modal-backdrop fade show" onClick={closeModal} />

			{/* Modal */}
			<div className="modal fade show d-block" ref={modalEl} tabIndex="-1" style={{ display: "block" }}>
				<div className="modal-dialog modal-dialog-centered modal-xl modal-fullscreen-xl-down modal-dialog-scrollable">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title">{watchTitle || modalTitle}</h5>
							<button type="button" className="btn-close" onClick={closeModal} />
						</div>
						<div className="modal-body">
							{tempProduct && (
								<form
									id="productForm"
									onSubmit={handleSubmit(onFormSubmit, () => toast.info("請修正表單中的錯誤 OwO'!"))}
								>
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
													className={`form-control ${errors.title ? "is-invalid" : ""}`}
													placeholder="請輸入標題"
													{...register("title", { required: "此欄位為必填" })}
												/>
												{errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
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
														className={`form-control ${errors.category ? "is-invalid" : ""}`}
														placeholder="請輸入主分類"
														{...register("category", { required: "此欄位為必填" })}
													/>
													{errors.category && (
														<div className="invalid-feedback">{errors.category.message}</div>
													)}
												</div>

												<div className="mb-3 col-lg-5">
													<label htmlFor="subcategory" className="form-label">
														次分類 <span className="text-danger">*</span>
													</label>
													<input
														id="subcategory"
														type="text"
														className={`form-control ${errors.subcategory ? "is-invalid" : ""}`}
														placeholder="請輸入次分類"
														{...register("subcategory", { required: "此欄位為必填" })}
													/>
													{errors.subcategory && (
														<div className="invalid-feedback">{errors.subcategory.message}</div>
													)}
												</div>

												<div className="mb-3 col-lg-2">
													<label htmlFor="unit" className="form-label">
														單位 <span className="text-danger">*</span>
													</label>
													<input
														id="unit"
														type="text"
														className={`form-control ${errors.unit ? "is-invalid" : ""}`}
														placeholder="單位"
														{...register("unit", { required: "此欄位為必填" })}
													/>
													{errors.unit && <div className="invalid-feedback">{errors.unit.message}</div>}
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
														className={`form-control ${errors.origin_price ? "is-invalid" : ""}`}
														placeholder="請輸入原價"
														{...register("origin_price", {
															required: "此欄位為必填",
															valueAsNumber: true,
															min: { value: 1, message: "原價必須大於 0" },
														})}
													/>
													{errors.origin_price && (
														<div className="invalid-feedback">{errors.origin_price.message}</div>
													)}
												</div>

												<div className="mb-3 col-lg-5">
													<label htmlFor="price" className="form-label">
														售價 <span className="text-danger">*</span>
													</label>
													<input
														id="price"
														type="number"
														min="1"
														className={`form-control ${errors.price ? "is-invalid" : ""}`}
														placeholder="請輸入售價"
														{...register("price", {
															required: "此欄位為必填",
															valueAsNumber: true,
															min: { value: 1, message: "售價必須大於 0" },
														})}
													/>
													{errors.price && (
														<div className="invalid-feedback">{errors.price.message}</div>
													)}
												</div>

												<div className="mb-3 col-lg-2">
													<label htmlFor="num" className="form-label">
														庫存 <span className="text-danger">*</span>
													</label>
													<input
														id="num"
														type="number"
														min="0"
														className={`form-control ${errors.num ? "is-invalid" : ""}`}
														placeholder="庫存"
														{...register("num", {
															required: "此欄位為必填",
															valueAsNumber: true,
															min: { value: 0, message: "數量不能小於 0" },
														})}
													/>
													{errors.num && <div className="invalid-feedback">{errors.num.message}</div>}
												</div>
											</div>

											<hr />

											{/* 產品描述 */}
											<div className="mb-3">
												<label htmlFor="description" className="form-label">
													產品描述 <span className="text-danger">*</span>
												</label>
												<textarea
													id="description"
													rows={6}
													className={`form-control ${errors.description ? "is-invalid" : ""}`}
													placeholder="請輸入產品描述"
													{...register("description", { required: "此欄位為必填" })}
												/>
											</div>

											{/* 說明內容 */}
											<div className="mb-3">
												<label htmlFor="content" className="form-label">
													說明內容 <span className="text-danger">*</span>
												</label>
												<textarea
													id="content"
													rows={6}
													className={`form-control ${errors.content ? "is-invalid" : ""}`}
													placeholder="請輸入說明內容"
													{...register("content", { required: "此欄位為必填" })}
												/>
											</div>

											{/* 是否啟用 */}
											<div className="mb-3">
												<div className="form-check">
													<input
														id="is_enabled"
														className="form-check-input p-0"
														type="checkbox"
														{...register("is_enabled")}
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
													{labels?.map((tag, index) => (
														<div key={index} className="input-group">
															<input
																type="text"
																className="form-control"
																value={tag}
																onChange={(e) => {
																	const newTags = [...labels];
																	newTags[index] = e.target.value.trim();
																	setValue("label", newTags, { shouldDirty: true });
																}}
																placeholder={`${index + 1} (例如：熱銷、限時)`}
															/>
															<button
																className="btn btn-outline-danger"
																style={{
																	borderTopRightRadius: "8px",
																	borderBottomRightRadius: "8px",
																}}
																type="button"
																onClick={() =>
																	setValue(
																		"label",
																		labels.filter((_, i) => i !== index),
																		{ shouldDirty: true }
																	)
																}
															>
																移除
															</button>
														</div>
													))}

													<button
														type="button"
														className={`btn btn-primary ${labels?.length >= 3 ? "d-none" : ""}`}
														onClick={() =>
															setValue("label", [...(labels || []), ""], { shouldDirty: true })
														}
													>
														+ 新增標籤
													</button>
												</div>

												{labels?.length > 0 && (
													<div className="mt-3">
														<small className="text-muted">目前標籤預覽：</small>
														<div className="d-flex flex-wrap gap-2 mt-1">
															{labels.map(
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
													{flavors?.map((flavor, index) => (
														<div key={index} className="input-group">
															<input
																type="text"
																className="form-control"
																value={flavor}
																onChange={(e) => {
																	const newFlavors = [...flavors];
																	newFlavors[index] = e.target.value.trim();
																	setValue("flavor", newFlavors, { shouldDirty: true });
																}}
																placeholder={`${index + 1} (例如：小辣、辛辣)`}
															/>
															<button
																className="btn btn-outline-danger"
																style={{
																	borderTopRightRadius: "8px",
																	borderBottomRightRadius: "8px",
																}}
																type="button"
																onClick={() =>
																	setValue(
																		"flavor",
																		flavors.filter((_, i) => i !== index),
																		{ shouldDirty: true }
																	)
																}
															>
																移除
															</button>
														</div>
													))}

													<button
														type="button"
														className={`btn btn-primary ${flavors?.length >= 2 ? "d-none" : ""}`}
														onClick={() =>
															setValue("flavor", [...(flavors || []), ""], { shouldDirty: true })
														}
													>
														+ 新增口味
													</button>
												</div>

												{flavors?.length > 0 && (
													<div className="mt-3">
														<small className="text-muted">目前口味預覽：</small>
														<div className="d-flex flex-wrap gap-2 mt-1">
															{flavors.map(
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
													placeholder="請上傳最少一張圖片"
													{...register("imageUrl", { required: "此欄位為必填" })}
												/>

												{imageUrl?.trim() && (
													<div className="mt-2 border rounded overflow-hidden">
														<img
															src={imageUrl.trim()}
															alt="主要圖片預覽"
															className="img-fluid"
															style={{
																maxHeight: "250px",
																objectFit: "cover",
																width: "100%",
															}}
															onError={(e) => {
																e.target.src =
																	"https://placehold.co/600x400?text=No+Image";
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
															name="file-to-upload"
															ref={mainImageInputRef}
															aria-describedby="uploadImageButton"
															aria-label="Upload"
														/>
														<button
															className="btn btn-outline-secondary py-0"
															type="button"
															id="uploadImageButton"
															onClick={uploadMainImage}
														>
															上傳
														</button>
													</div>
												</div>
											</div>

											{/* 多張附加圖片管理 */}
											<div>
												<p className="fw-bold mb-3">附加圖片（可多張，上傳後自動加入）</p>

												{imagesUrl?.map((url, index) => (
													<div
														key={index}
														className="input-group mb-3 align-items-center position-relative overflow-hidden"
														style={{ borderRadius: "6px" }}
													>
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
																	e.target.src =
																		"https://via.placeholder.com/60?text=錯誤";
																}}
															/>
															<small className="text-truncate flex-grow-1">
																{url}
															</small>
														</div>
														<button
															className="btn btn-danger position-absolute top-0 end-0 z-1 d-flex justify-content-center align-items-center"
															style={{
																width: "24px",
																height: "24px",
																padding: 0,
															}}
															type="button"
															onClick={() =>
																setValue(
																	"imagesUrl",
																	imagesUrl.filter((_, i) => i !== index),
																	{ shouldDirty: true }
																)
															}
														>
															×
														</button>
													</div>
												))}

												<button
													type="button"
													className="btn btn-primary w-100 mb-3"
													onClick={() => setUploadingImages(true)}
												>
													+ 上傳新圖片
												</button>

												{/* 上傳新附加圖片的區域（點擊後展開） */}
												{uploadingImages && (
													<div className="border border-primary rounded p-3 mb-3 bg-dark bg-opacity-50">
														<div className="d-flex justify-content-between align-items-center mb-2">
															<label className="form-label mb-0 text-white">
																選擇圖片上傳
															</label>
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
																		setPreviewImage(URL.createObjectURL(file));
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
																	{selectedFile?.name} (
																	{(selectedFile?.size / 1024 / 1024).toFixed(2)} MB)
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
								</form>
							)}
						</div>

						<div className="modal-footer">
							<button type="submit" form="productForm" className="btn btn-secondary">
								確定
							</button>
							<button type="button" className="btn btn-danger" onClick={closeModal}>
								關閉
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
});

export default ProductFormModal;
