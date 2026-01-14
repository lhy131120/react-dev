import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Modal } from "bootstrap";
import "./App.css";

const API_BASE = "https://ec-course-api.hexschool.io/v2";
const API_PATH = "kitchen-traveler";

function App() {
	const [isAuth, setIsAuth] = useState(false);
	const [products, setProducts] = useState([]);
	const [adminProducts, setAdminProducts] = useState([]);
	const [tempProduct, setTempProduct] = useState(null);
	const [viewMode, setViewMode] = useState("products"); // 'products' or 'dashboard'
	const [pendingAction, setPendingAction] = useState(null);
	const [loginData, setLoginData] = useState({
		username: "",
		password: "",
	});

	// 存放真正的 Bootstrap Modal 實例
	const productModalInstance = useRef(null);
	const adminModalInstance = useRef(null);
	const loginModalInstance = useRef(null);
	const deleteItemModalInstance = useRef(null);

	// DOM 參考（用來初始化 Modal）
	const productModalRef = useRef(null);
	const adminModalRef = useRef(null);
	const loginModalRef = useRef(null);
	const deleteItemModalRef = useRef(null);

	const getProducts = async () => {
		try {
			const response = await axios.get(`${API_BASE}/api/${API_PATH}/products/all`);
			const { products } = response.data;
			const productArr = Object.keys(products).map((id) => ({
				id,
				...products[id],
			}));
			setProducts(productArr);
		} catch (error) {
			console.error("取得產品列表失敗:", error?.response?.data || error);
		}
	};

	const getAdminProducts = async () => {
		const token = getTokenFromCookie();
		if (!token) {
			console.warn("無 token，無法取得管理員產品");
			return;
		}

		try {
			const response = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products/all`, {
				headers: { Authorization: `${token}` },
			});
			const { products } = response.data;
			const productArr = Object.keys(products).map((id) => ({
				id,
				...products[id],
			}));
			setAdminProducts(productArr);
		} catch (error) {
			console.error("取得管理員產品列表失敗:", error?.response?.data || error);
			if (error?.response?.status === 401) {
				alert("401：登入已失效或無權限，請重新登入");
				openModal("login");
			}
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setLoginData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleModalInputChange = (e) => {
		const { id, value, type, checked } = e.target;
		setTempProduct((prev) => ({
			...prev,
			[id]: type === "checkbox" ? (checked ? 1 : 0) : value,
		}));
	};

	const getTokenFromCookie = () => {
		const name = "hexToken=";
		const decodedCookie = decodeURIComponent(document.cookie);
		const ca = decodedCookie.split(";");
		for (let i = 0; i < ca.length; i++) {
			let c = ca[i].trim();
			if (c.indexOf(name) === 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	};

	// 送出登入
	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const response = await axios.post(`${API_BASE}/admin/signin`, loginData);
			const { token, expired } = response.data;

			// 設定 cookie
			document.cookie = `hexToken=${token}; expires=${new Date(expired).toUTCString()}; path=/`;

			// 設定 headers for future requests
			axios.defaults.headers.common["Authorization"] = `${token}`;

			setIsAuth(true);
			loginModalInstance.current?.hide();

			// 如果有 pending action，執行它
			if (pendingAction === "showDashboard") {
				setViewMode("dashboard");
				await getAdminProducts();
				setPendingAction(null);
			}
		} catch (err) {
			console.error("登入失敗", err?.response?.data || err);
			alert(err?.response?.data?.message || "登入失敗，請檢查帳號密碼");
		}
	};

	const showAdminDashboard = () => {
		if (isAuth) {
			setViewMode("dashboard");
			getAdminProducts(); // 確保最新數據
		} else {
			setPendingAction("showDashboard");
			openModal("login");
		}
	};

	const showProductsArea = () => {
		setViewMode("products");
    getProducts();
	};

	// Admin Actions
	const handleDeleteItem = async (id) => {
		const token = getTokenFromCookie();
		if (!token) {
			console.warn("無 token，無法刪除產品");
			return;
		}

		try {
			const response = await axios.delete(`${API_BASE}/api/${API_PATH}/admin/product/${id}`, {
				headers: { Authorization: `${token}` },
			});
			alert(`${response.data.message}`);
			getAdminProducts(); // 重新獲取產品列表
		} catch (error) {
			console.error("刪除產品失敗:", error?.response?.data || error);
			alert(error?.response?.data?.message || "刪除產品失敗");
		}
	};

	const updateProduct = async () => {
		const token = getTokenFromCookie();
		if (!token) {
			console.warn("無 token，無法更新/新增產品");
			return;
		}

		try {
			const payload = {
				data: {
					...tempProduct,
					origin_price: Number(tempProduct.origin_price),
					price: Number(tempProduct.price),
					is_enabled: tempProduct.is_enabled ? 1 : 0,
					imagesUrl: (tempProduct.imagesUrl || []).filter((url) => url && url.trim() !== ""), // 過濾空值
				},
			}; // API 需要的格式 { data: { ... } }
			let response;

			if (tempProduct.id) {
				// 更新既有產品
				response = await axios.put(`${API_BASE}/api/${API_PATH}/admin/product/${tempProduct.id}`, payload, {
					headers: { Authorization: `${token}` },
				});
			} else {
				// 新增產品
				response = await axios.post(`${API_BASE}/api/${API_PATH}/admin/product`, payload, {
					headers: { Authorization: `${token}` },
				});
			}

			alert(response.data.message || "操作成功");
			closeModal(tempProduct.id ? "edit" : "newItem");
			getAdminProducts(); // 重新載入列表
		} catch (error) {
			console.error("更新/新增產品失敗:", error?.response?.data || error);
			alert(error?.response?.data?.message || "操作失敗");
		}
	};

	useEffect(() => {
		const token = getTokenFromCookie();
		if (token) {
			axios.defaults.headers.common["Authorization"] = `${token}`;
			setIsAuth(true);
			getAdminProducts(); // 如果已登入，預載 admin 數據
		}

		getProducts();

		const handleModalHide = (e) => (e.target.inert = true);
		const handleModalShow = (e) => (e.target.inert = false);

		// init Bootstrap Modal instance
		productModalInstance.current = new Modal(productModalRef.current, {
			keyboard: false,
			backdrop: "static",
		});

		adminModalInstance.current = new Modal(adminModalRef.current, {
			keyboard: true,
			backdrop: true,
		});

		loginModalInstance.current = new Modal(loginModalRef.current, {
			keyboard: true,
			backdrop: true,
		});

		deleteItemModalInstance.current = new Modal(deleteItemModalRef.current, {
			keyboard: true,
			backdrop: true,
		});

		productModalRef.current.addEventListener("hide.bs.modal", handleModalHide);
		productModalRef.current.addEventListener("show.bs.modal", handleModalShow);
		adminModalRef.current.addEventListener("hide.bs.modal", handleModalHide);
		adminModalRef.current.addEventListener("show.bs.modal", handleModalShow);
		loginModalRef.current.addEventListener("hide.bs.modal", handleModalHide);
		loginModalRef.current.addEventListener("show.bs.modal", handleModalShow);
		deleteItemModalRef.current.addEventListener("hide.bs.modal", handleModalHide);
		deleteItemModalRef.current.addEventListener("show.bs.modal", handleModalShow);

		return () => {
			productModalInstance.current?.dispose();
			adminModalInstance.current?.dispose();
			loginModalInstance.current?.dispose();
			deleteItemModalInstance.current?.dispose();
		};
	}, []);

	const openModal = (type, item = null) => {
		if (type === "product") {
			setTempProduct(item);
			productModalInstance.current?.show();
		} else if (type === "edit") {
			setTempProduct({ ...item }); // 複製一份，避免修改原資料
			adminModalInstance.current?.show();
		} else if (type === "newItem") {
			setTempProduct({
				title: "",
				category: "",
				unit: "",
				origin_price: "",
				price: "",
				description: "",
				content: "",
				is_enabled: 1,
				imageUrl: "",
				imagesUrl: [],
			});
			adminModalInstance.current?.show();
		} else if (type === "login") {
			loginModalInstance.current?.show();
		} else if (type === "delete") {
			setTempProduct(item);
			deleteItemModalInstance.current?.show();
		} else {
			console.warn("未知的 modal type:", type);
		}
	};

	const closeModal = (type) => {
		if (type === "product") {
			productModalInstance.current?.hide();
		} else if (type === "edit" || type === "newItem") {
			adminModalInstance.current?.hide();
		} else if (type === "delete") {
			deleteItemModalInstance.current?.hide();
		} else if (type === "login") {
			loginModalInstance.current?.hide();
		}
		setTempProduct(null); // 統一清空
	};

	return (
		<>
			<div className="container py-5">
				<div className="row">
					<div className="col-12 text-center mb-4">
						<p className="fw-bold text-primary">Login Status: {isAuth ? "已登入" : "未登入"}</p>
					</div>
				</div>
				{viewMode === "products" && (
					<div>
						<div className="d-flex mb-5 justify-content-between align-items-center">
							<h1 className="fs-4 fw-bold text-primary">Product List</h1>
							<button type="button" className="btn btn-primary" onClick={showAdminDashboard}>
								Show Dashboard
							</button>
						</div>
						{products.length === 0 ? (
							<h2 className="text-center py-5">目前沒有產品資料...</h2>
						) : (
							<div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4 mb-5">
								{products.map((item) => (
									<div key={item.id} className="col">
										<div className="card h-100 shadow-sm hover-shadow transition">
											<img
												src={item.imageUrl}
												alt={item.title}
												className="card-img-top"
												style={{ height: "200px", objectFit: "cover" }}
											/>
											<div className="card-body d-flex flex-column">
												<h2 className="fs-6 card-title fw-bold">{item.title}</h2>

												<div className="mt-1">
													<p className="fs-6 text-danger fw-bold mb-2">
														${item.price} / {item.unit}
													</p>
												</div>

												<button className="btn btn-primary mt-auto fw-bold" onClick={() => openModal("product", item)}>
													<small>查看細節</small>
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}
				{viewMode === "dashboard" && (
					<div>
						<div className="d-flex mb-5 justify-content-between align-items-center">
							<h1 className="fs-4 fw-bold text-primary">Dashboard</h1>
							<div className="d-flex gap-2">
								<button type="button" className="btn btn-secondary" onClick={showProductsArea}>
									回前台
								</button>
								<button type="button" className="btn btn-success" onClick={() => openModal("newItem")}>
									新增產品
								</button>
							</div>
						</div>
						{adminProducts.length === 0 ? (
							<h2 className="text-center py-5">目前沒有產品資料...</h2>
						) : (
							<div className="table-responsive">
								<div className="d-flex justify-content-between align-items-center mb-3 text-primary">
									<h4 className="text-primary mb-0">List of products</h4>
									<span>列表數量：{adminProducts.length}</span>
								</div>
								<table className="table">
									<thead>
										<tr>
											<th scope="col" style={{ width: "80px" }}>
												圖片
											</th>
											<th scope="col">產品名稱</th>
											<th scope="col">狀態</th>
											<th scope="col">操作</th>
										</tr>
									</thead>
									<tbody>
										{adminProducts.map((item) => (
											<tr key={item.id} className="align-middle">
												<td>
													<img
														src={item.imageUrl}
														alt={item.title}
														style={{ width: "80px", height: "80px", objectFit: "cover" }}
													/>
												</td>
												<td>{item.title}</td>
												<td>
													<span className={`badge ${item.is_enabled === 1 ? "bg-success" : "bg-secondary"}`}>
														{item.is_enabled === 1 ? "啟用" : "未啟用"}
													</span>
												</td>
												<td>
													<div className="d-flex align-items-center gap-1">
														<button
															className="btn btn-sm btn-outline-warning me-2"
															onClick={() => openModal("edit", item)}
														>
															編輯
														</button>
														<button className="btn btn-sm btn-outline-danger" onClick={() => openModal("delete", item)}>
															刪除
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Product Display Modal */}
			<div className="modal fade" ref={productModalRef} tabIndex="-1">
				<div className="modal-dialog modal-dialog-centered modal-lg">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title">{tempProduct?.title || "產品資訊"}</h5>
							<button type="button" className="btn-close" data-bs-dismiss="modal"></button>
						</div>
						<div className="modal-body">
							{tempProduct && (
								<div className="row g-4">
									{/* 圖片區 */}
									<div className="col-md-6">
										<img
											src={tempProduct.imageUrl}
											alt={tempProduct.title}
											className="img-fluid rounded mb-3 shadow"
											style={{ height: "350px", objectFit: "cover", width: "100%" }}
										/>
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
															style={{ width: "80px", height: "80px", objectFit: "cover" }}
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
										<p className="mb-3">{tempProduct.description}</p>
										<p className="text-muted small">內容：{tempProduct.content}</p>

										<div className="my-4">
											<p className="text-decoration-line-through text-muted">
												原價：${tempProduct.origin_price} {tempProduct.unit}
											</p>
											<p className="fs-3 text-danger fw-bold">
												售價：${tempProduct.price} {tempProduct.unit}
											</p>
										</div>

										<p className="mb-2">
											庫存：{tempProduct.num} {tempProduct.unit}
										</p>
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
							<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
								關閉
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Admin Use Display Modal */}
			<div className="modal fade" ref={adminModalRef} tabIndex="-1">
				<div className="modal-dialog modal-dialog-centered modal-xl">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title">Admin - {tempProduct?.title || "管理員產品資訊"}</h5>
							<button type="button" className="btn-close" data-bs-dismiss="modal"></button>
						</div>
						<div className="modal-body">
							{tempProduct && (
								<div className="row g-4">
									{/* 圖片編輯區 - 主要圖片 + 多張附圖 */}
									<div className="col-md-4">
										{/* 主要圖片 */}
										<div className="mb-4">
											<label htmlFor="imageUrl" className="form-label fw-bold">
												主要圖片網址
											</label>
											<input
												id="imageUrl"
												type="url"
												className="form-control mb-2"
												placeholder="https://example.com/main.jpg"
												value={tempProduct.imageUrl || ""}
												onChange={handleModalInputChange}
											/>
											{tempProduct.imageUrl && (
												<div className="mt-2 border rounded overflow-hidden">
													<img
														src={tempProduct.imageUrl}
														alt="主要圖片預覽"
														className="img-fluid"
														style={{ maxHeight: "250px", objectFit: "cover", width: "100%" }}
														onError={(e) => {
															e.target.src = "https://via.placeholder.com/300x250?text=圖片載入失敗";
														}}
													/>
												</div>
											)}
										</div>

										{/* 多張附圖管理 */}
										<div>
											<label className="form-label fw-bold">附加圖片（可多張）</label>
											{tempProduct.imagesUrl?.map((url, index) => (
												<div key={index} className="input-group mb-2">
													<input
														type="url"
														className="form-control"
														value={url}
														onChange={(e) => {
															const newImages = [...tempProduct.imagesUrl];
															newImages[index] = e.target.value;
															setTempProduct((prev) => ({ ...prev, imagesUrl: newImages }));
														}}
														placeholder={`附加圖片 ${index + 1}`}
													/>
													<button
														className="btn btn-outline-danger"
														type="button"
														onClick={() => {
															const newImages = tempProduct.imagesUrl.filter((_, i) => i !== index);
															setTempProduct((prev) => ({ ...prev, imagesUrl: newImages }));
														}}
													>
														移除
													</button>
												</div>
											))}

											<button
												type="button"
												className="btn btn-outline-primary mt-2 w-100"
												onClick={() => {
													const newImages = [...(tempProduct.imagesUrl || []), ""];
													setTempProduct((prev) => ({ ...prev, imagesUrl: newImages }));
												}}
											>
												+ 新增一張附加圖片
											</button>

											{/* 附加圖片預覽 */}
											{tempProduct.imagesUrl?.length > 0 && (
												<div className="mt-3">
													<small className="text-muted">預覽：</small>
													<div className="d-flex flex-wrap gap-2 mt-2">
														{tempProduct.imagesUrl.map((url, i) =>
															url.trim() ? (
																<div key={i} className="position-relative" style={{ width: "80px", height: "80px" }}>
																	<img
																		src={url}
																		alt={`附加圖片 ${i + 1}`}
																		className="rounded shadow-sm object-cover w-100 h-100"
																		onError={(e) => {
																			e.target.src = "https://via.placeholder.com/80?text=錯誤";
																		}}
																	/>
																</div>
															) : null
														)}
													</div>
												</div>
											)}
										</div>
									</div>

									{/* 其他資訊區（原內容保持不變） */}
									<div className="col-sm-8">
										<div className="mb-3">
											<label htmlFor="title" className="form-label">
												標題
											</label>
											<input
												id="title"
												type="text"
												className="form-control"
												placeholder="請輸入標題"
												value={tempProduct.title}
												onChange={handleModalInputChange}
											/>
										</div>
										<div className="row">
											<div className="mb-3 col-md-6">
												<label htmlFor="category" className="form-label">
													分類
												</label>
												<input
													id="category"
													type="text"
													className="form-control"
													placeholder="請輸入分類"
													value={tempProduct.category}
													onChange={handleModalInputChange}
												/>
											</div>
											<div className="mb-3 col-md-6">
												<label htmlFor="unit" className="form-label">
													單位
												</label>
												<input
													id="unit"
													type="text"
													className="form-control"
													placeholder="請輸入單位"
													value={tempProduct.unit}
													onChange={handleModalInputChange}
												/>
											</div>
										</div>
										<div className="row">
											<div className="mb-3 col-md-6">
												<label htmlFor="origin_price" className="form-label">
													原價
												</label>
												<input
													id="origin_price"
													type="number"
													min="0"
													className="form-control"
													placeholder="請輸入原價"
													value={tempProduct.origin_price}
													onChange={handleModalInputChange}
												/>
											</div>
											<div className="mb-3 col-md-6">
												<label htmlFor="price" className="form-label">
													售價
												</label>
												<input
													id="price"
													type="number"
													min="0"
													className="form-control"
													placeholder="請輸入售價"
													value={tempProduct.price}
													onChange={handleModalInputChange}
												/>
											</div>
											<hr />
											<div className="mb-3">
												<label htmlFor="description" className="form-label">
													產品描述
												</label>
												<textarea
													id="description"
													className="form-control"
													placeholder="請輸入產品描述"
													value={tempProduct.description}
													onChange={handleModalInputChange}
												></textarea>
											</div>
											<div className="mb-3">
												<label htmlFor="content" className="form-label">
													說明內容
												</label>
												<textarea
													id="content"
													className="form-control"
													placeholder="請輸入說明內容"
													value={tempProduct.content}
													onChange={handleModalInputChange}
												></textarea>
											</div>
											<div className="mb-3">
												<div className="form-check">
													<input
														id="is_enabled"
														className="form-check-input"
														type="checkbox"
														checked={tempProduct.is_enabled === 1}
														onChange={handleModalInputChange}
													/>
													<label className="form-check-label" htmlFor="is_enabled">
														是否啟用
													</label>
												</div>
											</div>
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

			{/* Admin Use Confirm Delete Modal */}
			<div className="modal fade" ref={deleteItemModalRef} tabIndex="-1">
				<div className="modal-dialog modal-dialog-centered modal-md">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title">刪除確認</h5>
						</div>
						<div className="modal-body">
							<p className="mb-0">確定要刪除 {tempProduct?.title} 嗎？</p>
						</div>
						<div className="modal-footer justify-content-center">
							<button type="button" className="btn btn-secondary" onClick={() => closeModal("delete")}>
								取消
							</button>
							<button
								type="button"
								className="btn btn-danger"
								onClick={() => {
									handleDeleteItem(tempProduct.id);
									closeModal("delete");
								}}
							>
								刪除
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Login Modal */}
			<div className="modal fade" ref={loginModalRef} tabIndex="-1">
				<div className="modal-dialog modal-dialog-centered modal-md">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title">登入</h5>
							<button type="button" className="btn-close" data-bs-dismiss="modal"></button>
						</div>
						<div className="modal-body">
							<form onSubmit={handleSubmit}>
								<div className="mb-3">
									<label htmlFor="username" className="form-label">
										用戶名
									</label>
									<input
										type="text"
										className="form-control"
										id="username"
										name="username"
										placeholder="請輸入用戶名"
										value={loginData.username}
										onChange={handleInputChange}
										required
									/>
								</div>

								<div className="mb-3">
									<label htmlFor="password" className="form-label">
										密碼
									</label>
									<input
										type="password"
										className="form-control"
										id="password"
										name="password"
										placeholder="請輸入密碼"
										value={loginData.password}
										onChange={handleInputChange}
										required
									/>
								</div>

								<button type="submit" className="btn btn-primary w-100 py-2 mt-3">
									登入
								</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
export default App;
