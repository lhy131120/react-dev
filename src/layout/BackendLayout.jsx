import { Outlet } from "react-router";

const BackendLayout = () => {
	return (
		<div className="admin-layout">
			<main className="container flex-grow-1 py-4">
				<Outlet />
			</main>
			<footer className="site-footer admin-footer">
				<div className="container">
					<p>🛠️ 後台管理系統 | © 2026 熱帶調味料天堂</p>
				</div>
			</footer>
		</div>
	);
};

export default BackendLayout;
