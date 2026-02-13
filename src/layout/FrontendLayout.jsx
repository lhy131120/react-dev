import { Outlet, NavLink } from "react-router";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "@/styles/Header.css";

// SVG Icons
const HomeIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
		<path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
	</svg>
);

const ProductIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
		<path d="M3 6h18" />
		<path d="M16 10a4 4 0 0 1-8 0" />
	</svg>
);

const CartIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<circle cx="8" cy="21" r="1" />
		<circle cx="19" cy="21" r="1" />
		<path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
	</svg>
);

const UserIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
		<circle cx="12" cy="7" r="4" />
	</svg>
);

const MenuIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<line x1="4" x2="20" y1="12" y2="12" />
		<line x1="4" x2="20" y1="6" y2="6" />
		<line x1="4" x2="20" y1="18" y2="18" />
	</svg>
);

const CloseIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M18 6 6 18" />
		<path d="m6 6 12 12" />
	</svg>
);

const FrontendLayout = () => {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const cartItemCount = useSelector((state) => state.cart.carts.length);

	// 當選單打開時禁止背景滾動
	useEffect(() => {
		mobileMenuOpen ? (document.body.style.overflow = "hidden") : (document.body.style.overflow = "");
		// 清理函數：組件卸載時恢復滾動
		return () => (document.body.style.overflow = "");
	}, [mobileMenuOpen]);

	const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
	const closeMobileMenu = () => setMobileMenuOpen(false);

	return (
		<>
			<header className="site-header">
				<div className="header-container">
					{/* Logo */}
					<NavLink to="/" className="logo" onClick={closeMobileMenu}>
						<div className="logo-icon">🌶️</div>
						<div className="logo-text">
							熱帶<span>調味料</span>
						</div>
					</NavLink>

					{/* Desktop Navigation */}
					<nav className="nav-desktop">
						<NavLink to="/" className="nav-link">
							<HomeIcon />
							首頁
						</NavLink>
						<NavLink to="products" className="nav-link">
							<ProductIcon />
							產品
						</NavLink>
						<NavLink to="cart" className="nav-link cart-link">
							<CartIcon />
							購物車
							{cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
						</NavLink>
						<NavLink to="login" className="btn-login-nav">
							<UserIcon />
							登入
						</NavLink>
					</nav>

					{/* Mobile Menu Toggle */}
					<button
						className="mobile-menu-toggle"
						onClick={toggleMobileMenu}
						aria-label={mobileMenuOpen ? "關閉選單" : "開啟選單"}
					>
						{mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
					</button>
				</div>

				{/* Mobile Backdrop */}
				<div
					className={`mobile-backdrop ${mobileMenuOpen ? "open" : ""}`}
					onClick={closeMobileMenu}
					aria-hidden="true"
				/>

				{/* Mobile Navigation */}
				<nav className={`nav-mobile ${mobileMenuOpen ? "open" : ""}`}>
					<NavLink to="/" className="nav-link" onClick={closeMobileMenu}>
						<HomeIcon />
						首頁
					</NavLink>
					<NavLink to="products" className="nav-link" onClick={closeMobileMenu}>
						<ProductIcon />
						產品
					</NavLink>
					<NavLink to="cart" className="nav-link cart-link" onClick={closeMobileMenu}>
						<CartIcon />
						購物車
						{cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
					</NavLink>
					<NavLink to="login" className="nav-link" onClick={closeMobileMenu}>
						<UserIcon />
						登入
					</NavLink>
				</nav>
			</header>

			<main className="container flex-grow-1 py-4">
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
