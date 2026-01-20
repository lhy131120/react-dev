import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

import ProductList from "./components/ProductList";
import ProductDetailModal from "./components/ProductDetailModal";
import AdminHeader from "./components/Admin/AdminHeader";
import ProductTable from "./components/Admin/ProductTable";
import Pagination from "./components/Admin/Pagination";
import ProductFormModal from "./components/Admin/ProductFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import LoginModal from "./components/LoginModal";

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
	const [loginData, setLoginData] = useState({ username: "", password: "" });
	const [formErrors, setFormErrors] = useState({});

	// Modal refs
	const productModalRef = useRef(null);
	const adminModalRef = useRef(null);
	const loginModalRef = useRef(null);
	const deleteModalRef = useRef(null);

	// Image upload states
	const [uploadingImages, setUploadingImages] = useState(false);
	const [previewImage, setPreviewImage] = useState(null);
	const [selectedFile, setSelectedFile] = useState(null);
	const [isUploading, setIsUploading] = useState(false);
	const uploadImageInputRef = useRef(null);

	// Pagination
	const [pagination, setPagination] = useState({
		category: "",
		current_page: 1,
		has_pre: false,
		has_next: false,
		total_pages: 1,
	});

	const [currentPage, setCurrentPage] = useState(1);

	// ────────────────────────────────────────────────
	//  Utility Functions
	// ────────────────────────────────────────────────
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
			productModalRef.current?.show();
		} else if (type === "edit") {
			setTempProduct({ ...item });
			adminModalRef.current?.show();
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
			adminModalRef.current?.show();
		} else if (type === "login") {
			loginModalRef.current?.show();
		} else if (type === "delete") {
			setTempProduct(item);
			deleteModalRef.current?.show();
		} else {
			console.warn("未知的 modal type:", type);
		}

    
	};

	// 修正後的 closeModal：只呼叫 ref.hide() + 執行清理
	const closeModal = (type) => {
		if (type === "product") {
			productModalRef.current?.hide();
		} else if (type === "edit" || type === "newItem") {
			adminModalRef.current?.hide();
			setFormErrors({});
		} else if (type === "delete") {
			deleteModalRef.current?.hide();
		} else if (type === "login") {
			loginModalRef.current?.hide();
		}

		// 所有 modal 關閉後統一清空 tempProduct（視需求可調整）
		setTempProduct(null);
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
			getAdminProducts();
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
			const file = uploadImageInputRef.current.files[0];
			const formData = new FormData();
			formData.append("file-to-upload", file);
			const response = await axios.post(`${API_BASE}/api/${API_PATH}/admin/upload`, formData);
			const { imageUrl } = response.data;

			setTempProduct({
				...tempProduct,
				imageUrl,
			});
		} catch (error) {
			console.error("上傳圖片失敗:", error?.response?.data || error);
			alert(error?.response?.data?.message || "上傳圖片失敗");
		}
	};

	const handleUploadImage = async () => {
		if (!selectedFile) return;

		setIsUploading(true);

		try {
			const formData = new FormData();
			formData.append("file-to-upload", selectedFile);

			const response = await axios.post(`${API_BASE}/api/${API_PATH}/admin/upload`, formData, {
				headers: {
					Authorization: `${getTokenFromCookie()}`,
				},
			});

			const { imageUrl } = response.data;

			// 上傳成功：加入 imagesUrl 陣列
			setTempProduct((prev) => ({
				...prev,
				imagesUrl: [...(prev.imagesUrl || []), imageUrl],
			}));

			// alert("圖片上傳成功！");
		} catch (error) {
			console.error("上傳圖片失敗:", error?.response?.data || error);
			alert(error?.response?.data?.message || "上傳圖片失敗");
		} finally {
			setIsUploading(false);
			setUploadingImages(false); // 上傳完自動關閉區塊
			setPreviewImage(null);
			setSelectedFile(null);
			if (uploadImageInputRef.current) {
				uploadImageInputRef.current.value = ""; // 清空 input
			}
		}
	};

	useEffect(() => {
		const token = getTokenFromCookie();
		if (token) {
			axios.defaults.headers.common["Authorization"] = `${token}`;
			setIsAuth(true);
			getAdminProducts(currentPage);
		}
		getProducts();

	}, []);

	return (
		<>
			<div className="container py-5">
				<div className="row">
					<div className="col-12 text-center mb-4">
						<p className="fw-bold text-primary">登入狀態: {isAuth ? "已登入" : "未登入"}</p>
					</div>
				</div>
				{viewMode === "products" && (
					<ProductList products={products} openModal={openModal} showAdminDashboard={showAdminDashboard} />
				)}
				
				{viewMode === "dashboard" && (
					<div>
						<div className="d-flex mb-5 justify-content-between align-items-center">
							<h1 className="fs-4 fw-bold text-primary">儀表板</h1>
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
									<button className="btn btn-outline-primary" onClick={() => getAdminProducts(currentPage)}>
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
							<>
								<ProductTable adminProducts={adminProducts} openModal={openModal} />
								{pagination.total_pages > 1 && (
									<Pagination pagination={pagination} currentPage={currentPage} getAdminProducts={getAdminProducts} />
								)}
							</>
						)}
					</div>
				)}
			</div>

			{/* Modal */}
			<ProductDetailModal ref={productModalRef} tempProduct={tempProduct} onClose={() => closeModal("product")} />

			<ProductFormModal
				ref={adminModalRef}
				tempProduct={tempProduct}
				setTempProduct={setTempProduct}
				formErrors={formErrors}
				handleModalInputChange={handleModalInputChange}
				updateProduct={updateProduct}
				closeModal={() => closeModal(tempProduct?.id ? "edit" : "newItem")}
				uploadingImages={uploadingImages}
				setUploadingImages={setUploadingImages}
				previewImage={previewImage}
				setPreviewImage={setPreviewImage}
				selectedFile={selectedFile}
				setSelectedFile={setSelectedFile}
				isUploading={isUploading}
				uploadImageInputRef={uploadImageInputRef}
				uploadImage={uploadImage}
				handleUploadImage={handleUploadImage}
			/>

			<DeleteConfirmModal
				ref={deleteModalRef}
				tempProduct={tempProduct}
				handleDeleteItem={handleDeleteItem}
				onClose={() => closeModal("delete")}
			/>

			<LoginModal
				ref={loginModalRef}
				loginData={loginData}
				handleInputChange={handleInputChange}
				handleSubmit={handleSubmit}
				onClose={() => closeModal("login")}
			/>
		</>
	);
}
export default App;
