const AdminHeader = ({showProductsArea, handleLogout, openModal}) => {
	return (
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
	);
};

export default AdminHeader;
