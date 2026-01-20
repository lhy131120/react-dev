export default function Pagination({ pagination, currentPage, getAdminProducts }) {
	if (pagination.total_pages <= 1) return null;

	return (
		<div className="pagination-container mt-5 d-flex justify-content-center align-items-center gap-3 flex-wrap">
			{/* 上一頁 */}
			<button
				className="btn btn-outline-primary pagination-btn"
				onClick={() => getAdminProducts(currentPage - 1)}
				disabled={!pagination.has_pre}
			>
				<i className="bi bi-chevron-left me-1"></i>上一頁
			</button>

			{/* 頁碼按鈕（只顯示前後幾頁 + 首尾） */}
			{Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
				.filter((page) => page === 1 || page === pagination.total_pages || Math.abs(page - currentPage) <= 2)
				.map((page, idx, arr) => (
					<div key={`page-${idx + 1}`}>
						{/* 省略符號 */}
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
	);
}
