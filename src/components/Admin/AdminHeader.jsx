import { useNavigate } from "react-router";
const AdminHeader = ({handleLogout, openModal}) => {
  const navigate = useNavigate();
	return (
		<div className="d-flex mb-5 justify-content-between align-items-center">
			<h1 className="fs-4 fw-bold" style={{ color: '#92400e' }}>
				🌶️ 後台管理
			</h1>
			<div className="d-flex gap-2">
				<button 
					type="button" 
					className="btn btn-secondary" 
					onClick={() => navigate("/")}
					style={{ borderColor: '#d97706' }}
				>
					回前台
				</button>
				<button 
					type="button" 
					className="btn btn-danger" 
					onClick={handleLogout}
				>
					登出
				</button>
				<button 
					type="button" 
					className="btn btn-success" 
					onClick={() => openModal("newItem")}
				>
					新增產品
				</button>
			</div>
		</div>
	);
};

export default AdminHeader;
