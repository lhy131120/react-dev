import "@/styles/ProductTable.css";

export default function ProductTable({ adminProducts, openModal }) {
	return (
		<div className="product-table-wrapper">
			{/* 標題列 */}
			<div className="product-table-header">
				<h2 className="product-table-title">
					<span className="title-icon">📦</span>
					產品列表
				</h2>
				<span className="product-count">
					共 <strong>{adminProducts.length}</strong> 項產品
				</span>
			</div>

			{/* 產品列表 */}
			<div className="product-list">
				{adminProducts.length === 0 ? (
					<div className="empty-state">
						<span className="empty-icon">🌶️</span>
						<p>目前沒有產品資料</p>
					</div>
				) : (
					adminProducts.map((item) => (
						<div key={item.id} className="product-item">
							{/* 圖片區域 */}
							<div className="product-image-wrapper">
								<img
									src={item.imageUrl}
									alt={item.title}
									className="product-image"
									onError={(e) => {
										e.target.src = "https://placehold.co/80x80?text=No+Image";
									}}
								/>
							</div>

							{/* 產品資訊 */}
							<div className="product-info">
								<h3 className="product-title">{item.title}</h3>
								<div className="product-meta">
									<span className="product-category">{item.category}</span>
									<span className={`product-status ${item.is_enabled === 1 ? "status-active" : "status-inactive"}`}>
										{item.is_enabled === 1 ? "啟用" : "未啟用"}
									</span>
								</div>
							</div>

							{/* 操作按鈕 */}
							<div className="product-actions">
								<button
									className="action-btn edit-btn"
									onClick={() => openModal("edit", item)}
									title="編輯產品"
								>
									<span className="btn-icon">✏️</span>
									<span className="btn-text">編輯</span>
								</button>
								<button
									className="action-btn delete-btn"
									onClick={() => openModal("delete", item)}
									title="刪除產品"
								>
									<span className="btn-icon">🗑️</span>
									<span className="btn-text">刪除</span>
								</button>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}
