import { Outlet, NavLink } from "react-router";
const FrontendLayout = () => {
	return (
		<>
			<header className="py-5 d-flex justify-content-center">
				<ul className="nav">
					<li className="nav-item">
						<NavLink className="nav-link" to="/">
							首頁
						</NavLink>
					</li>
					<li className="nav-item">
						<NavLink className="nav-link" to="products">
							產品
						</NavLink>
					</li>
					<li className="nav-item">
						<NavLink className="nav-link" to="cart">
							購物車
						</NavLink>
					</li>
					<li className="nav-item">
						<NavLink className="nav-link" to="login">
							登入頁
						</NavLink>
					</li>
				</ul>
			</header>

			<div className="container">
				<Outlet />
			</div>

			{/* <footer>Footer</footer> */}
		</>
	);
};

export default FrontendLayout;
