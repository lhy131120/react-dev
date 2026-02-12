import { Provider } from "react-redux";
import { store } from "@/store";
import { createRoot } from "react-dom/client";
import App from "@/App.jsx";

// plug-in
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// style
import "@/assets/all.scss";
import "@/App.css";

createRoot(document.getElementById("root")).render(
	<>
		{/* 動態粒子背景 */}
		<div className="particles-bg">
			{[...Array(8)].map((_, i) => (
				<div
					key={`large-${i}`}
					className="particle large"
					style={{
						width: `${Math.random() * 20 + 10}px`,
						height: `${Math.random() * 20 + 10}px`,
						left: `${Math.random() * 100}%`,
						top: `${Math.random() * 100}%`,
						animationDelay: `${Math.random() * 40}s`,
						animationDuration: `${Math.random() * 80 + 60}s`,
						background: `rgba(${Math.random() > 0.5 ? 167 : 99}, ${Math.random() > 0.5 ? 139 : 102}, ${
							Math.random() > 0.5 ? 250 : 241
						}, 0.15)`,
					}}
				/>
			))}
			{[...Array(12)].map((_, i) => (
				<div
					key={`mid-${i}`}
					className="particle mid"
					style={{
						width: `${Math.random() * 8 + 4}px`,
						height: `${Math.random() * 8 + 4}px`,
						left: `${Math.random() * 100}%`,
						top: `${Math.random() * 100}%`,
						animationDelay: `${Math.random() * 30}s`,
						animationDuration: `${Math.random() * 50 + 40}s`,
					}}
				/>
			))}
			{[...Array(20)].map((_, i) => (
				<div
					key={`small-${i}`}
					className="particle small"
					style={{
						width: `${Math.random() * 4 + 2}px`,
						height: `${Math.random() * 4 + 2}px`,
						left: `${Math.random() * 100}%`,
						top: `${Math.random() * 100}%`,
						animationDelay: `${Math.random() * 15}s`,
						animationDuration: `${Math.random() * 25 + 15}s`,
					}}
				/>
			))}
		</div>

		<Provider store={store}>
			<App />
		</Provider>

		<ToastContainer
			position="top-right" 
			autoClose={2000} 
			hideProgressBar={false} 
			newestOnTop={false}
			closeOnClick
			rtl={false}
			pauseOnFocusLoss
			draggable
			pauseOnHover
			theme="light" // light / dark / colored
			transition={Bounce} // 可選：Flip / Bounce / Zoom 等動畫
		/>
	</>
);
