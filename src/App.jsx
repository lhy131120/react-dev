import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Modal } from "bootstrap";
import "./App.css";

function App() {
	const API_BASE = "https://ec-course-api.hexschool.io/v2";
	const API_PATH = "kitchen-traveler";
	const modalRef = useRef(null);
	const myModal = useRef(null);

	const [isAuth, setIsAuth] = useState(false);
	const [products, setProducts] = useState([]);
	const [tempProduct, setTempProduct] = useState(null);

	const [loginData, setLoginData] = useState({
		username: "",
		password: "",
	});

	// 取得 token 的輔助函式
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

	// 檢查登入狀態
	const checkAuth = async (token) => {
		try {
			if (!token) {
				setIsAuth(false);
				return;
			}

			const response = await axios.post(
				`${API_BASE}/api/user/check`,
				{},
				{
					headers: {
						Authorization: token,
					},
				}
			);
			if (response.data.success) {
				setIsAuth(true);
				getProducts();
			} else {
				setIsAuth(false);
			}
		} catch (err) {
			console.error("自動驗證失敗", err?.response?.data || err);
			setIsAuth(false);
		}
	};

	// 取得產品列表
	const getProducts = async () => {
		try {

      const token = getTokenFromCookie();
      if(!token) throw new Error("No token found");

			const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products/all`,{
        headers: { Authorization: token}
      });

			const { products } = res.data;
			const productArr = Object.keys(products).map((id) => ({
				id,
				...products[id],
			}));

			setProducts(productArr);
		} catch (err) {
			console.error("取得產品失敗", err?.response?.data || err);
			alert("取得產品列表失敗，請重新登入");
		}
	};

	// 登入表單輸入處理
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setLoginData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// 送出登入
	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const response = await axios.post(`${API_BASE}/admin/signin`, loginData);
			const { token, expired } = response.data;

			// 設定 cookie
			document.cookie = `hexToken=${token}; expires=${new Date(expired).toUTCString()}; path=/`;

			setIsAuth(true);
			await getProducts();
		} catch (err) {
			console.error("登入失敗", err?.response?.data || err);
			alert(err?.response?.data?.message || "登入失敗，請檢查帳號密碼");
		}
	};

	// 初始化 Bootstrap Modal + 檢查登入狀態
	useEffect(() => {
		const modalElement = modalRef.current;
		if (!modalElement) return;

		myModal.current = new Modal(modalRef.current, {
			backdrop: "static",
			keyboard: true,
		});

		const handleModalHide = (e) => (e.target.inert = true);
		const handleModalShow = (e) => (e.target.inert = false);

		modalRef.current.addEventListener("hide.bs.modal", handleModalHide);
		modalRef.current.addEventListener("show.bs.modal", handleModalShow);

		// 組件載入時檢查是否已登入

		const token = getTokenFromCookie();
		if (token) {
			axios.defaults.headers.common["Authorization"] = token;
			checkAuth(token);
		}

		return () => {
			modalElement.removeEventListener("hide.bs.modal", handleModalHide);
			modalElement.removeEventListener("show.bs.modal", handleModalShow);
		};
	}, []);

	const openModal = (product) => {
		setTempProduct(product);
		myModal.current.show();
	};

	return (
		<div className="container py-5">
			{isAuth ? (
				<>
					<h1 className="text-center mb-5 fw-bold">產品列表</h1>

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
											style={{ height: "220px", objectFit: "cover" }}
										/>
										<div className="card-body d-flex flex-column">
											<h2 className="fs-6 card-title fw-bold">{item.title}</h2>

											<div className="mt-3">
												<p className="fs-5 text-danger fw-bold mb-2">
													${item.price} / {item.unit}
												</p>
											</div>

											<button className="btn btn-primary mt-auto fw-bold" onClick={() => openModal(item)}>
												<small>查看細節</small>
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</>
			) : (
				<div className="row justify-content-center">
					<div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
						<div className="login-container p-4 shadow rounded bg-white">
							<h1 className="fs-4 fw-bold text-center mb-4">後台登入</h1>

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
			)}

			{/* Modal */}
			<div className="modal fade" ref={modalRef} tabIndex="-1">
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
		</div>
	);
}

export default App;
