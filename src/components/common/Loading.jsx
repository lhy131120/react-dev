import { useLoading } from "@/hooks";
import "@/styles/Loading.css";

const Loading = () => {
	const { isLoading } = useLoading();

	if (!isLoading) return null;

	return (
		<div className="loading-overlay">
			<div className="loading-container">
				{/* 旋转的辣椒图标 */}
				<div className="loading-spinner">
					<span className="pepper-icon">🌶️</span>
				</div>

				{/* 加载文字 */}
				<p className="loading-text">加載中...</p>

				{/* 加载进度条 */}
				<div className="loading-bar">
					<div className="loading-progress"></div>
				</div>
			</div>
		</div>
	);
};

export default Loading;
