import { useNavigate } from "react-router";
import { useState, useEffect } from "react";

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
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				minHeight: "60vh",
				textAlign: "center",
				padding: "2rem",
			}}
		>
			{/* 404 動畫數字 */}
			<div
				style={{
					fontSize: "clamp(6rem, 20vw, 12rem)",
					fontWeight: 800,
					background: "linear-gradient(135deg, #d97706, #f59e0b, #fbbf24)",
					WebkitBackgroundClip: "text",
					WebkitTextFillColor: "transparent",
					backgroundClip: "text",
					lineHeight: 1,
					marginBottom: "1rem",
					animation: "float 3s ease-in-out infinite",
				}}
			>
				404
			</div>

			{/* 迷路的調味料圖示 */}
			<div
				style={{
					fontSize: "4rem",
					marginBottom: "1.5rem",
					animation: "shake 2s ease-in-out infinite",
				}}
			>
				🌶️🧂🫗
			</div>

			{/* 標題 */}
			<h1
				style={{
					fontSize: "clamp(1.5rem, 4vw, 2rem)",
					color: "#92400e",
					marginBottom: "0.75rem",
					fontWeight: 700,
				}}
			>
				哎呀！這個頁面走丟了
			</h1>

			{/* 描述 */}
			<p
				style={{
					fontSize: "1.1rem",
					color: "#78350f",
					marginBottom: "2rem",
					maxWidth: "400px",
					lineHeight: 1.6,
				}}
			>
				看起來這個頁面像調味料一樣被打翻了...
				<br />
				別擔心，讓我們幫你找到回家的路！
			</p>

			{/* 倒數計時 */}
			<p
				style={{
					fontSize: "0.95rem",
					color: "#a16207",
					marginBottom: "1.5rem",
				}}
			>
				<span style={{ fontWeight: 600 }}>{countdown}</span> 秒後自動返回首頁
			</p>

			{/* 按鈕群組 */}
			<div
				style={{
					display: "flex",
					gap: "1rem",
					flexWrap: "wrap",
					justifyContent: "center",
				}}
			>
				<button
					onClick={() => navigate("/")}
					style={{
						padding: "0.875rem 2rem",
						fontSize: "1rem",
						fontWeight: 600,
						color: "#fff",
						background: "linear-gradient(135deg, #d97706, #f59e0b)",
						border: "none",
						borderRadius: "50px",
						cursor: "pointer",
						transition: "all 0.3s ease",
						boxShadow: "0 4px 15px rgba(217, 119, 6, 0.3)",
					}}
					onMouseOver={(e) => {
						e.target.style.transform = "translateY(-3px)";
						e.target.style.boxShadow = "0 8px 25px rgba(217, 119, 6, 0.4)";
					}}
					onMouseOut={(e) => {
						e.target.style.transform = "translateY(0)";
						e.target.style.boxShadow = "0 4px 15px rgba(217, 119, 6, 0.3)";
					}}
				>
					🏠 返回首頁
				</button>

				<button
					onClick={() => navigate("/products")}
					style={{
						padding: "0.875rem 2rem",
						fontSize: "1rem",
						fontWeight: 600,
						color: "#92400e",
						background: "rgba(217, 119, 6, 0.1)",
						border: "2px solid rgba(217, 119, 6, 0.3)",
						borderRadius: "50px",
						cursor: "pointer",
						transition: "all 0.3s ease",
					}}
					onMouseOver={(e) => {
						e.target.style.background = "rgba(217, 119, 6, 0.2)";
						e.target.style.borderColor = "#d97706";
						e.target.style.transform = "translateY(-3px)";
					}}
					onMouseOut={(e) => {
						e.target.style.background = "rgba(217, 119, 6, 0.1)";
						e.target.style.borderColor = "rgba(217, 119, 6, 0.3)";
						e.target.style.transform = "translateY(0)";
					}}
				>
					🛒 逛逛商品
				</button>
			</div>

			{/* CSS 動畫 */}
			<style>{`
				@keyframes float {
					0%, 100% { transform: translateY(0); }
					50% { transform: translateY(-15px); }
				}
				@keyframes shake {
					0%, 100% { transform: rotate(0deg); }
					25% { transform: rotate(-5deg); }
					75% { transform: rotate(5deg); }
				}
			`}</style>
		</div>
	);
};

export default NotFound;
