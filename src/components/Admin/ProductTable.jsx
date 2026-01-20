export default function ProductTable({ adminProducts, openModal }) {
	return (
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
									style={{
										width: "80px",
										height: "80px",
										objectFit: "cover",
									}}
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
									<button className="btn btn-sm btn-outline-warning me-2" onClick={() => openModal("edit", item)}>
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
	);
}
