import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Modal } from "bootstrap";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

const requiredFields = [
	"category",
	"subcategory",
	"content",
	"description",
	"origin_price",
	"price",
	"title",
	"unit",
	"num",
	"imageUrl",
];

function App() {
	const [adminLoading, setAdminLoading] = useState(false);
	const [adminError, setAdminError] = useState(null);
	const [isAuth, setIsAuth] = useState(false);
	const [products, setProducts] = useState([]);
	const [adminProducts, setAdminProducts] = useState([]);
	const [tempProduct, setTempProduct] = useState(null);
	const [viewMode, setViewMode] = useState("products");
	const [pendingAction, setPendingAction] = useState(null);
	const [loginData, setLoginData] = useState({
		username: "",
		password: "",
	});

	const [formErrors, setFormErrors] = useState({});

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
  const uploadImageInutRef = useRef(null);

	// pagination
	const [pagination, setPagination] = useState({
		category: "",
		current_page: 1,
		has_pre: false,
		has_next: false,
		total_pages: 1,
	});

	const [currentPage, setCurrentPage] = useState(1);

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

	const openModal = (type, item = null) => {
		if (type === "edit" || type === "newItem") {
			setFormErrors({});
		}

		if (type === "product") {
			setTempProduct(item);
			productModalInstance.current?.show();
		} else if (type === "edit") {
			setTempProduct({ ...item }); // 複製一份，避免修改原資料
			adminModalInstance.current?.show();
		} else if (type === "newItem") {
			setTempProduct({
				category: "",
				subcategory: "",
				content: "",
				description: "",
				origin_price: 1,
				price: 1,
				title: "",
				unit: "",
				num: 0,
				imageUrl: "",
				imagesUrl: [],
				is_enabled: 1,
				label: [],
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
		// setTempProduct(null);

		if (type === "edit" || type === "newItem") {
			setFormErrors({});
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

		let newValue = type === "checkbox" ? (checked ? 1 : 0) : value;

		// 數字欄位強制轉 number
		if (["origin_price", "price"].includes(id)) {
			newValue = value === "" ? "" : Number(value);
		}

		setTempProduct((prev) => ({
			...prev,
			[id]: newValue,
		}));

		// 即時驗證單一欄位
		setFormErrors((prev) => {
			const newErrors = { ...prev };

			// 必填檢查
			if (requiredFields.includes(id)) {
				if (!newValue && newValue !== 0) {
					newErrors[id] = "此欄位為必填";
				} else {
					delete newErrors[id];
				}
			}

			// 數字 > 0 檢查
			if (id === "origin_price") {
				if (newValue <= 0) {
					newErrors[id] = "原價必須大於 0";
				} else {
					delete newErrors[id];
				}
			} else if (id === "price") {
				if (newValue <= 0) {
					newErrors[id] = "售價必須大於 0";
				} else {
					delete newErrors[id];
				}
			} else if (id === "num") {
				if (newValue < 0) {
					newErrors[id] = "數量不能小於 0";
				} else {
					delete newErrors[id];
				}
			}

			return newErrors;
		});
	};

	const validateForm = () => {
		const errors = {};

		requiredFields.forEach((field) => {
			if (!tempProduct?.[field] && tempProduct?.[field] !== 0) {
				errors[field] = "此欄位為必填";
			}
		});

		// 數字欄位 > 0 檢查
		if (tempProduct?.origin_price <= 0) {
			errors.origin_price = "原價必須大於 0";
		}
		if (tempProduct?.price <= 0) {
			errors.price = "售價必須大於 0";
		}

		setFormErrors(errors);
		return Object.keys(errors).length === 0; // true 表示驗證通過
	};

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

	const getAdminProducts = async (page = 1) => {
		setAdminLoading(true);
		setAdminError(null);

		const token = getTokenFromCookie();
		if (!token) {
			console.warn("無 token，無法取得管理員產品");
			setAdminLoading(false);
			return;
		}

		try {
			const response = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products?page=${page}`, {
				headers: { Authorization: `${token}` },
			});

			const { pagination, products } = response.data;
			// 修正當刪除最後一筆產品時，products 可能為 undefined 的問題
			// const productsData = response.data?.products ?? {};
			// const productArr = Object.keys(productsData).map((id) => ({
			// 	id,
			// 	...productsData[id],
			// }));

			setPagination(
				pagination || {
					total_pages: 1,
					current_page: 1,
					has_pre: false,
					has_next: false,
					category: "",
				}
			);
			setCurrentPage(page);
			// setAdminProducts(productArr || []);
			setAdminProducts(products || []);
		} catch (error) {
			console.error("取得管理員產品列表失敗:", error?.response?.data || error);

			if (error?.response?.status === 401) {
				setIsAuth(false);
				setAdminProducts([]);
				setAdminError("權限不足，請重新登入");
				alert("Error 401: 權限不足，請重新登入");
				openModal("login");
			} else {
				setAdminError("載入產品失敗，請稍後再試");
			}
			setAdminProducts([]); // 清空列表以避免顯示過時資料
		} finally {
			setAdminLoading(false);
		}
	};

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

	const handleLogout = async () => {
		try {
			const response = await axios.post(`${API_BASE}/logout`);
			console.log(response.data.message);
			document.cookie = "hexToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
			axios.defaults.headers.common["Authorization"] = null;
			setIsAuth(false);
			setViewMode("products");
			getProducts();
		} catch (error) {
			console.error("登出失敗:", error?.response?.data || error);
		}
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
			getAdminProducts(currentPage); // 重新獲取產品列表
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

		if (!validateForm()) {
			alert("請修正表單中的錯誤");
			return;
		}

		try {
			const payload = {
				data: {
					...tempProduct,
					origin_price: Number(tempProduct.origin_price),
					price: Number(tempProduct.price),
					num: Number(tempProduct.num),
					is_enabled: tempProduct.is_enabled ? 1 : 0,
					imagesUrl: (tempProduct.imagesUrl || []).filter((url) => url && url.trim() !== ""),
					label: (tempProduct.label || []).filter((tag) => tag && tag.trim() !== ""),
				},
			};

			let response;

			if (tempProduct.id) {
				response = await axios.put(`${API_BASE}/api/${API_PATH}/admin/product/${tempProduct.id}`, payload, {
					headers: { Authorization: `${token}` },
				});
			} else {
				response = await axios.post(`${API_BASE}/api/${API_PATH}/admin/product`, payload, {
					headers: { Authorization: `${token}` },
				});
			}

			alert(response.data.message || "操作成功");
			closeModal(tempProduct.id ? "edit" : "newItem");
			getAdminProducts();
		} catch (error) {
			console.error("更新/新增產品失敗:", error?.response?.data || error);
			alert(error?.response?.data?.message || "操作失敗");
		}
	};

  const uploadImage = async () => {
    try {
      // console.dir(uploadImageInutRef.current)
      const file = uploadImageInutRef.current.files[0]
      // console.log(file)
      const formData = new FormData();
      formData.append('file-to-upload', file)
      const response = await axios.post(`${API_BASE}/api/${API_PATH}/admin/upload`, formData)
      console.log(response.data)
    } catch (error) {
      console.error("上傳圖片失敗:", error?.response?.data || error );
      alert(error?.response?.data?.message || "上傳圖片失敗");
    }


  }
	useEffect(() => {
		const token = getTokenFromCookie();
		if (token) {
			axios.defaults.headers.common["Authorization"] = `${token}`;
			setIsAuth(true);
			getAdminProducts(currentPage); // 如果已登入，預載 admin 數據
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

		const handleHidden = () => {
			setTempProduct(null); // 等完全隱藏再清空資料
		};

		[productModalRef, adminModalRef, deleteItemModalRef, loginModalRef].forEach((ref) => {
			if (ref.current) {
				ref.current.addEventListener("hidden.bs.modal", handleHidden);
			}
		});

		// cleanup function
		return () => {
			productModalInstance.current?.dispose();
			adminModalInstance.current?.dispose();
			loginModalInstance.current?.dispose();
			deleteItemModalInstance.current?.dispose();

			[productModalRef, adminModalRef, deleteItemModalRef, loginModalRef].forEach((ref) => {
				if (ref.current) {
					ref.current.removeEventListener("hidden.bs.modal", handleHidden);
				}
			});
		};
	}, []);

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
							<h2 className="text-center py-5 text-white">目前沒有產品資料...</h2>
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
								<button type="button" className="btn btn-danger" onClick={() => handleLogout()}>
									登出
								</button>
								<button type="button" className="btn btn-success" onClick={() => openModal("newItem")}>
									新增產品
								</button>
							</div>
						</div>
						{adminLoading ? (
							<div className="text-center py-10">
								<div
									className="spinner-border text-primary"
									role="status"
									style={{ width: "4rem", height: "4rem" }}
								></div>
								<h4 className="mt-4 text-primary">正在載入產品資料...</h4>
							</div>
						) : adminError ? (
							<div className="text-center py-10">
								<div className="alert alert-danger d-inline-block">
									<h4 className="mb-3">{adminError}</h4>
									<button className="btn btn-outline-primary" onClick={getAdminProducts}>
										重新載入
									</button>
								</div>
							</div>
						) : adminProducts.length === 0 ? (
							<div className="text-center py-10">
								<h2 className="text-white-50">目前沒有產品資料</h2>
								<p className="text-muted mt-3">點擊「新增產品」來建立第一筆資料吧！</p>
							</div>
						) : (
							<div className="table-responsive overflow-hidden">
								<div className="d-flex justify-content-between align-items-center mb-3 text-primary">
									<h2 className="text-primary mb-0 h6">產品列表</h2>
									<span>列表數量：{adminProducts.length}</span>
								</div>
								<table className="table">
									<thead>
										<tr>
											<th scope="col" style={{ width: "80px" }}>
												圖片
											</th>
											<th scope="col">產品名稱</th>
											<th scope="col">主分類</th>
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
												<td>{item.category}</td>
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
						{pagination.total_pages > 1 && (
							<div className="pagination-container mt-5 d-flex justify-content-center align-items-center gap-3 flex-wrap">
								{/* 上一頁 */}
								<button
									className="btn btn-outline-primary pagination-btn"
									onClick={() => getAdminProducts(currentPage - 1)}
									disabled={!pagination.has_pre}
								>
									<i className="bi bi-chevron-left me-1"></i>上一頁
								</button>

								{Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
									.filter((page) => page === 1 || page === pagination.total_pages || Math.abs(page - currentPage) <= 2)
									.map((page, idx, arr) => (
										<div key={`page-${idx + 1}`}>
											{idx > 0 && page - arr[idx - 1] > 1 && <span className="pagination-ellipsis">...</span>}
											<button 
												className={`btn pagination-number p-0 d-flex justify-content-center align-items-center rounded-circle ${
													currentPage === page ? "active" : ""
												}`}
												onClick={() => getAdminProducts(page)}
											>
												{page}
											</button>
										</div>
									))}

								{/* 下一頁 */}
								<button
									className="btn btn-outline-primary pagination-btn"
									onClick={() => getAdminProducts(currentPage + 1)}
									disabled={!pagination.has_next}
								>
									下一頁<i className="bi bi-chevron-right ms-1"></i>
								</button>
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
										{tempProduct?.imageUrl?.trim() && (
											<img
												src={tempProduct.imageUrl.trim()}
												alt={tempProduct.title}
												className="img-fluid rounded mb-3 shadow"
												style={{ height: "350px", objectFit: "cover", width: "100%" }}
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
							<h5 className="modal-title">{tempProduct?.title || "新增產品"}</h5>
							<button type="button" className="btn-close" data-bs-dismiss="modal"></button>
						</div>
						<div className="modal-body">
							{tempProduct && (
								<div className="row flex-row-reverse g-4">
									{/* 其他資訊區 */}
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
										{/* 主分類  + 次分類 + 單位 */}
										<div className="row">
											<div className="mb-3 col-lg-5">
												<label htmlFor="category" className="form-label">
													主分類 <span className="text-danger">*</span>
												</label>
												<input
													id="category"
													type="text"
													className={`form-control ${formErrors.category ? "is-invalid" : ""}`}
													placeholder="請輸入單位"
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
										<div className="mb-3">
											<label htmlFor="description" className="form-label">
												產品描述 <span className="text-danger">*</span>
											</label>
											<textarea
												rows={6}
												id="description"
												className={`form-control ${formErrors.description ? "is-invalid" : ""}`}
												placeholder="請輸入產品描述"
												value={tempProduct.description}
												onChange={handleModalInputChange}
											></textarea>
										</div>
										{/* 說明內容 */}
										<div className="mb-3">
											<label htmlFor="content" className="form-label">
												說明內容<span className="text-danger">*</span>
											</label>
											<textarea
												rows={6}
												id="content"
												className={`form-control ${formErrors.content ? "is-invalid" : ""}`}
												placeholder="請輸入說明內容"
												value={tempProduct.content}
												onChange={handleModalInputChange}
											></textarea>
										</div>
										{/* Enable */}
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

											<div className="d-flex align-items-center gap-2">
												{tempProduct?.label?.map((tag, index) => (
													<div key={index} className="input-group mb-2 mb-lg-0">
														<input
															id={`tag-${index + 1}`}
															name={`tag-${index + 1}`}
															type="text"
															className="form-control"
															value={tag}
															onChange={(e) => {
																const newTags = [...tempProduct.label];
																newTags[index] = e.target.value.trim(); // 自動去除前後空白
																setTempProduct((prev) => ({ ...prev, label: newTags }));
															}}
															placeholder={`${index + 1} (例如：熱銷、限時)`}
														/>
														<button
															className="btn btn-outline-danger"
															type="button"
															onClick={() => {
																const newTags = tempProduct.label.filter((_, i) => i !== index);
																setTempProduct((prev) => ({ ...prev, label: newTags }));
															}}
														>
															移除
														</button>
													</div>
												))}

												<button
													type="button"
													className={`btn btn-outline-primary w-100 ${tempProduct.label?.length >= 3 ? "d-none" : ""}`}
													onClick={() => {
														const newTags = [...(tempProduct.label || []), ""];
														setTempProduct((prev) => ({ ...prev, label: newTags }));
													}}
												>
													+ 新增標籤
												</button>
											</div>

											{/* 簡單預覽（可選） */}
											{tempProduct?.label?.length > 0 && (
												<div className="mt-3">
													<small className="text-muted">目前標籤：</small>
													<div className="d-flex flex-wrap gap-2 mt-1">
														{tempProduct.label.map((tag, i) =>
															tag.trim() ? (
																<span key={i} className="badge bg-info text-white">
																	{tag.trim()}
																</span>
															) : null
														)}
													</div>
												</div>
											)}
										</div>
										{/* 口味管理 */}
										<div className="mb-3 col-lg-8">
											<p className="form-label fw-bold">可選口味（可加入）</p>

											<div className="d-flex align-items-center gap-2">
												{tempProduct?.flavor?.map((flavor, index) => (
													<div key={index} className="input-group mb-2 mb-lg-0">
														<input
															id={`flavor-${index + 1}`}
															name={`flavor-${index + 1}`}
															type="text"
															className="form-control"
															value={flavor}
															onChange={(e) => {
																const newFlavors = [...tempProduct.flavor];
																newFlavors[index] = e.target.value.trim(); // 自動去除前後空白
																setTempProduct((prev) => ({ ...prev, flavor: newFlavors }));
															}}
															placeholder={`${index + 1} (例如：小辣、辛辣)`}
														/>
														<button
															className="btn btn-outline-danger"
															type="button"
															onClick={() => {
																const newFlavors = tempProduct.flavor.filter((_, i) => i !== index);
																setTempProduct((prev) => ({ ...prev, flavor: newFlavors }));
															}}
														>
															移除
														</button>
													</div>
												))}

												<button
													type="button"
													className={`btn btn-outline-primary w-100 ${tempProduct.flavor?.length >= 2 ? "d-none" : ""}`}
													onClick={() => {
														const newFlavors = [...(tempProduct.flavor || []), ""];
														setTempProduct((prev) => ({ ...prev, flavor: newFlavors }));
													}}
												>
													+ 新增口味
												</button>
											</div>

											{/* 簡單預覽（可選） */}
											{tempProduct?.flavor?.length > 0 && (
												<div className="mt-3">
													<div className="d-flex align-items-center gap-2">
														<small className="text-muted">目前標籤：</small>
														<div className="d-flex flex-wrap gap-2">
															{tempProduct.flavor.map((flavor, i) =>
																flavor.trim() ? (
																	<span key={i} className="badge bg-info text-white">
																		{flavor.trim()}
																	</span>
																) : null
															)}
														</div>
													</div>
												</div>
											)}
										</div>
									</div>
									{/* 圖片編輯區 - 主要圖片 + 多張附圖 */}
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
											{tempProduct.imageUrl && (
												<div className="mt-2 border rounded overflow-hidden">
													<img
														src={tempProduct.imageUrl.trim()}
														alt="主要圖片預覽"
														className="img-fluid"
														style={{ maxHeight: "250px", objectFit: "cover", width: "100%" }}
														onError={(e) => {
															e.target.src = "https://dummyimage.com/600x400/000/fff&text=dummy";
														}}
													/>
												</div>
											)}
											<div className="mt-2">
												<form action="/api/thisismycourse2/admin/upload" encType="multipart/form-data" method="post">
                          <input type="file" name="file-to-upload" ref={uploadImageInutRef} className="btn btn-outline-primary" onChange={() => uploadImage()} />
                          {/* <input type="submit" value="Upload" className="btn btn-outline-primary" on /> */}
												</form>
											</div>
										</div>

										{/* 多張附圖管理 */}
										<div>
											<p className="fw-bold">附加圖片（可多張）</p>
											{tempProduct.imagesUrl?.map((url, index) => (
												<div key={index} className="input-group mb-2">
													<input
														name={`imagesUrl-${index + 1}`}
														id={`imagesUrl-${index + 1}`}
														type="text"
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
																		className="rounded shadow-sm object-cover w-100 h-100 object-fit-cover"
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
