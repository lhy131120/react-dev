import { Outlet, NavLink } from "react-router";

const FrontendLayout = () => {

	return (
		<>
			<header className="py-5 d-flex justify-content-center">
				<ul className="nav">
					<li className="nav-item">
						<NavLink className="nav-link fw-bold" to="/">
							首頁
						</NavLink>
					</li>
					<li className="nav-item">
						<NavLink className="nav-link fw-bold" to="products">
							產品
						</NavLink>
					</li>
					<li className="nav-item">
						<NavLink className="nav-link fw-bold" to="cart">
							購物車
						</NavLink>
					</li>
					<li className="nav-item">
						<NavLink className="nav-link fw-bold" to="login">
							登入頁
						</NavLink>
					</li>
				</ul>
			</header>
			<main className="container flex-grow-1">
				<Outlet />
			</main>
			<footer className="site-footer">
				<div className="container">
					<p>© 2026 🌶️ 熱帶調味料天堂. All rights reserved.</p>
				</div>
			</footer>
		</>
	);
};

export default FrontendLayout;
