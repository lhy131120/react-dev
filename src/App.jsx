// React API
import { useState, useEffect, useRef } from "react";

// Plugin
import { Modal } from "bootstrap";

// CSS
import "./App.css";

function App() {
	const [tempProduct, setTempProduct] = useState(null);
	const modalRef = useRef(null);
	const myModal = useRef(null);

	const [products] = useState([
		{
			category: "甜甜圈",
			content: "尺寸：14x14cm",
			description: "濃郁的草莓風味，中心填入滑順不膩口的卡士達內餡，帶來滿滿幸福感！",
			id: "-L9tH8jxVb2Ka_DYPwng",
			is_enabled: 1,
			origin_price: 150,
			price: 99,
			title: "草莓莓果夾心圈",
			unit: "個",
			num: 10,
			imageUrl: "https://images.unsplash.com/photo-1583182332473-b31ba08929c8",
			imagesUrl: [
				"https://images.unsplash.com/photo-1626094309830-abbb0c99da4a",
				"https://images.unsplash.com/photo-1559656914-a30970c1affd",
			],
		},
		{
			category: "蛋糕",
			content: "尺寸：6寸",
			description: "蜜蜂蜜蛋糕，夾層夾上酸酸甜甜的檸檬餡，清爽可口的滋味讓人口水直流！",
			id: "-McJ-VvcwfN1_Ye_NtVA",
			is_enabled: 1,
			origin_price: 1000,
			price: 900,
			title: "蜂蜜檸檬蛋糕",
			unit: "個",
			num: 1,
			imageUrl:
				"https://images.unsplash.com/photo-1627834377411-8da5f4f09de8?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1001&q=80",
			imagesUrl: [
				"https://images.unsplash.com/photo-1618888007540-2bdead974bbb?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=987&q=80",
			],
		},
		{
			category: "蛋糕",
			content: "尺寸：6寸",
			description: "法式煎薄餅加上濃郁可可醬，呈現經典的美味及口感。",
			id: "-McJ-VyqaFlLzUMmpPpm",
			is_enabled: 1,
			origin_price: 700,
			price: 600,
			title: "暗黑千層",
			unit: "個",
			num: 15,
			imageUrl:
				"https://images.unsplash.com/photo-1505253149613-112d21d9f6a9?ixid=MnwxMjA3fDB8MHxzZWFyY2h8NDZ8fGNha2V8ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=60",
			imagesUrl: [
				"https://images.unsplash.com/flagged/photo-1557234985-425e10c9d7f1?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTA5fHxjYWtlfGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=60",
				"https://images.unsplash.com/photo-1540337706094-da10342c93d8?ixid=MnwxMjA3fDB8MHxzZWFyY2h8NDR8fGNha2V8ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=60",
			],
		},
	]);

	useEffect(() => {
		myModal.current = new Modal(modalRef.current, {
			backdrop: "static",
			keyboard: true,
		});
	}, []);

	const openModal = (product) => {
		setTempProduct(product);
		myModal.current.show();
	};

	return (
		<>
			{/* Modal */}
			<div className="modal fade" ref={modalRef} tabIndex="-1" aria-hidden="true">
				<div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
					<div className="modal-content">
						<div className="modal-header">
							<h1 className="modal-title fs-5">{tempProduct?.title || "載入中..."}</h1>
							<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<div className="modal-body">
							{tempProduct && (
								<div className="row g-4">
									<div className="col-md-6">
										<img
											src={tempProduct.imageUrl}
											alt={tempProduct.title}
											className="img-fluid rounded mb-3 shadow-sm"
											style={{ height: "350px", objectFit: "cover", width: "100%" }}
										/>
										{tempProduct.imagesUrl?.length > 0 && (
											<div className="d-flex gap-2 flex-wrap">
												{tempProduct.imagesUrl.map((img, i) => (
													<img
														key={i}
														src={img}
														alt=""
														className="rounded shadow-sm"
														style={{ width: "80px", height: "80px", objectFit: "cover" }}
													/>
												))}
											</div>
										)}
									</div>
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
										<p className="mb-0">
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

			{/* Product List - Card Grid */}
			<div className="container py-5">
				<h2 className="text-center mb-5 fw-bold">產品列表</h2>

				<div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
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
									<h5 className="card-title fw-bold">{item.title}</h5>
									<p className="card-text text-muted small flex-grow-1">{item.description}</p>

									<div className="mt-3">
										<p className="text-decoration-line-through text-muted mb-1">
											${item.origin_price} {item.unit}
										</p>
										<p className="fs-4 text-danger fw-bold mb-2">
											${item.price} / {item.unit}
										</p>
										<p className="text-muted small mb-2">
											狀態：
											<span className={`ms-2 badge ${item.is_enabled === 1 ? "bg-success" : "bg-secondary"}`}>
												{item.is_enabled === 1 ? "啟用" : "未啟用"}
											</span>
										</p>
									</div>

									<button className="btn btn-primary mt-auto" onClick={() => openModal(item)}>
										查看細節
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</>
	);
}

export default App;
