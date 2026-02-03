import { Outlet, NavLink } from "react-router";
const BackendLayout = () => {
	return (
		<>

			<div className="container">
				<Outlet />
			</div>

			{/* <footer>Footer</footer> */}
		</>
	);
};

export default BackendLayout;
