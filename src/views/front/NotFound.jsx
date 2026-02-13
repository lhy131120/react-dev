import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import "@/styles/NotFound.css";

const NotFound = () => {
	const navigate = useNavigate();
	const [countdown, setCountdown] = useState(10);

	useEffect(() => {
		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					navigate("/");
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [navigate]);

	return (
		<div className="not-found-page">
			<div className="not-found-code">404</div>
			<div className="not-found-emoji">🌶️🧂🫗</div>
			<h1 className="not-found-title">哎呀！這個頁面走丟了</h1>
			<p className="not-found-desc">
				看起來這個頁面像調味料一樣被打翻了...
				<br />
				別擔心，讓我們幫你找到回家的路！
			</p>
			<p className="not-found-countdown">
				<span>{countdown}</span> 秒後自動返回首頁
			</p>
			<div className="not-found-actions">
				<button className="not-found-btn-primary" onClick={() => navigate("/")}>
					🏠 返回首頁
				</button>
				<button className="not-found-btn-secondary" onClick={() => navigate("/products")}>
					🛒 逛逛商品
				</button>
			</div>
		</div>
	);
};

export default NotFound;
