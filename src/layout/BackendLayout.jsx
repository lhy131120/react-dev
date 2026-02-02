import { Outlet, NavLink } from "react-router";
const BackendLayout = () => {
	return (
		<>
			<header className="py-5 d-flex justify-content-center">
				<ul className="nav">
					<li className="nav-item">
						<NavLink className="nav-link" to="/">
							首頁
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

export default BackendLayout;
