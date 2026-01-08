// React API
import { useState, useEffect, useRef } from "react";

// Plugin
// import axios from "axios";
import { Modal } from "bootstrap";

// Inner Resources (Image, Video, css)
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
			unit: "元",
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
      backdrop: 'static',
      keyboard: true,
    });
	}, []);

	const modalShow = (product) => {
    setTempProduct(product)
		myModal.current.show();
	};

  const modalHide = () => {
		myModal.current.hide();
	};
	return (
		<>
			{/* Modal */}
			<div className="modal fade" ref={modalRef} tabIndex="-1" aria-hidden="true">
				<div className="modal-dialog modal-dialog-centered modal-lg">
					<div className="modal-content">
						<div className="modal-header">
							<h1 className="modal-title fs-5">{tempProduct?.title || "Loading..."}</h1>
							<button type="button" className="btn-close" onClick={() => modalHide()} aria-label="Close"></button>
						</div>
						<div className="modal-body">
							{tempProduct ? (
								<>
									<div className="row">
										<div className="col-md-6">
											<div style={{ height: "300px" }} className="mb-2">
												<img
													src={tempProduct.imageUrl}
													alt={tempProduct.title}
													className="rounded-1 h-100 w-100 object-fit-cover"
												/>
											</div>
											{tempProduct.imagesUrl?.length > 0 && (
												<div className="d-flex gap-2">
													{tempProduct.imagesUrl.map((img, i) => (
														<div key={i} style={{ width: "50px", height: "50px" }}>
															<img src={img} className="h-100 w-100 object-fit-cover rounded" alt="" />
														</div>
													))}
												</div>
											)}
										</div>
										<div className="col-md-6 text-start">
											<p className="fs-6">
												<strong>分類：</strong>
												{tempProduct.category}
											</p>
											<p className="fs-6">
												<strong>描述：</strong>
												{tempProduct.description}
											</p>
											<p className="fs-6">
												<strong>內容：</strong>
												{tempProduct.content}
											</p>
											<p className="fs-6">
												<strong>原價：</strong>
												<del>
													{tempProduct.origin_price} {tempProduct.unit}
												</del>
											</p>
											<p className="fs-6">
												<strong>售價：</strong>
												<span className="text-danger fs-4">
													{tempProduct.price} {tempProduct.unit}
												</span>
											</p>
											<p className="fs-6">
												<strong>庫存：</strong>
												{tempProduct.num}
											</p>
											<p className="fs-6">
												<strong>狀態：</strong>
												{tempProduct.is_enabled === 1 ? "啟用" : "未啟用"}
											</p>
										</div>
									</div>
								</>
							) : (
								<p>請選擇一個產品</p>
							)}
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-secondary" onClick={() => modalHide()}>
								關閉
							</button>
						</div>
					</div>
				</div>
			</div>
			{/* ProductList */}
			<div className="container">
				<div className="row mt-5">
					<div className="col">
						<h2>產品列表</h2>
						<table className="table">
							<thead>
								<tr className="d-none d-md-table-row">
									<th>產品名稱</th>
									<th>原價</th>
									<th>售價</th>
									<th>是否啟用</th>
									<th>查看細節</th>
								</tr>
							</thead>
							<tbody>
								{products.map((item) => (
									<tr key={item.id}>
										<td data-label="產品名稱">{item.title}</td>
										<td data-label="原價">{item.origin_price}</td>
										<td data-label="售價">{item.price}</td>
										<td data-label="是否啟用">{item.is_enabled === 1 ? "啟用" : "未啟用"}</td>
										<td data-label="查看細節">
											<button className="btn btn-primary" onClick={() => modalShow(item)}>
												查看細節
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</>
	);
}

export default App;
