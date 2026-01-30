import { useState, useEffect, useRef } from "react";
import axios from "axios";
import api, { authApi } from "./api/axiosInstance.js";
import "./App.css";

import ProductList from "./components/ProductList.jsx";
import ProductDetailModal from "./components/ProductDetailModal.jsx";
import AdminHeader from "./components/Admin/AdminHeader.jsx";
import ProductTable from "./components/Admin/ProductTable.jsx";
import Pagination from "./components/Admin/Pagination.jsx";
import ProductFormModal from "./components/Admin/ProductFormModal.jsx";
import DeleteConfirmModal from "./components/DeleteConfirmModal.jsx";
import LoginModal from "./components/LoginModal.jsx";

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
				imageUrl: "https://placehold.co/600x400?text=No+Image",
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
			// ★ 新增：關閉 admin modal 時，重設圖片上傳相關 state
			setUploadingImages(false);
			setPreviewImage(null);
			setSelectedFile(null);
			setIsUploading(false);
      if (uploadImageInputRef.current) {
				uploadImageInputRef.current.value = "";
			} 
		} else if (type === "delete") {
			deleteModalRef.current?.hide();
		} else if (type === "login") {
			loginModalRef.current?.hide();
		}

		// 所有 modal 關閉後統一清空 tempProduct（視需求可調整）
		setTempProduct(null);

		if (uploadImageInputRef.current) {
			uploadImageInputRef.current.value = ""; // 清空 input
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
		if (["origin_price", "price", "num"].includes(id)) {
			newValue = value === "" ? "" : Number(value);
			// 如果是 NaN，強制設為 0 或保持原值
			if (isNaN(newValue)) newValue = 0;
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
			const response = await api.get("/products/all");
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

		try {
			const response = await api.get(`/admin/products?page=${page}`);

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
			setAdminProducts([]); // clear old data
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
			document.cookie = "hexToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; // 先清一次
			document.cookie = `hexToken=${token}; expires=${new Date(expired).toUTCString()}; path=/`;

			// 設定 headers for future requests
			axios.defaults.headers.common["Authorization"] = `${token}`;

			setIsAuth(true);
			loginModalRef.current?.hide();

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
			await authApi.post("/logout");
			alert("登出成功");
		} catch (error) {
			if (error.response?.status === 400 && error.response?.data?.message === "請重新登出") {
				alert("後端表示已登出");
			} else {
				console.error("登出失敗:", error);
			}
		}

		// 本地強制清理
		document.cookie = "hexToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
		delete axios.defaults.headers.common["Authorization"];
		setIsAuth(false);
		setViewMode("products");
		getProducts();

		alert("已登出");
	};

	const handleDeleteItem = async (id) => {
		try {
			const response = await api.delete(`/admin/product/${id}`);
			alert(`${response.data.message}`);
			getAdminProducts(currentPage);
		} catch (error) {
			console.error("刪除產品失敗:", error?.response?.data || error);
			alert(error?.response?.data?.message || "刪除產品失敗");
		}
	};

	const updateProduct = async () => {
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
					// num: Number(tempProduct.num),
					num: Math.floor(Number(tempProduct.num)) || 0,
					is_enabled: tempProduct.is_enabled ? 1 : 0,
					imagesUrl: (tempProduct.imagesUrl || []).filter((url) => url && url.trim() !== ""),
					label: (tempProduct.label || []).filter((tag) => tag && tag.trim() !== ""),
				},
			};

			let response;

			if (tempProduct.id) {
				response = await api.put(`/admin/product/${tempProduct.id}`, payload);
			} else {
				response = await api.post(`/admin/product`, payload);
			}

			console.log("送出的 payload.num:", payload.data.num, typeof payload.data.num);

			alert(response.data.message || "操作成功");
			closeModal(tempProduct.id ? "edit" : "newItem");

			// getAdminProducts();

			/* ===== 測試用 ===== */
			await getAdminProducts(currentPage);
			const updatedItem = adminProducts.find((p) => p.id === tempProduct.id);
			console.log("更新後前端看到的 num:", updatedItem?.num);
			/* ===== 測試用 ===== */

		} catch (error) {
			console.error("更新/新增產品失敗:", error?.response?.data || error);
			alert(error?.response?.data?.message || "操作失敗");
		}
	};;

	const uploadImage = async () => {
		try {
			const file = uploadImageInputRef.current.files[0];
			const formData = new FormData();
			formData.append("file-to-upload", file);
			const response = await api.post("/admin/upload", formData);
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

			const response = await api.post("/admin/upload", formData);

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
			setUploadingImages(false); // 上傳完自動關閉區塊
			setPreviewImage(null);
			setSelectedFile(null);
			setIsUploading(false);
			if (uploadImageInputRef.current) {
				uploadImageInputRef.current.value = ""; // 清空 input
			}
		}
	};

	useEffect(() => {
		// const token = getTokenFromCookie();
		getProducts();

		if (document.cookie.includes("hexToken=")) {
			setIsAuth(true);
			getAdminProducts(currentPage);
		}
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
						<AdminHeader showProductsArea={showProductsArea} handleLogout={handleLogout} openModal={openModal} />

						{adminLoading ? (
							<div className="text-center py-10">
								<div
									className="spinner-border spinner-border-lg text-primary"
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
