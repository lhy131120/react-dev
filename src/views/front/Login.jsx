import { plainApi, setToken } from "@/services";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import "@/styles/Login.css";

// SVG Icons
const MailIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<rect width="20" height="16" x="2" y="4" rx="2" />
		<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
	</svg>
);

const LockIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
		<path d="M7 11V7a5 5 0 0 1 10 0v4" />
	</svg>
);

const EyeIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
		<circle cx="12" cy="12" r="3" />
	</svg>
);

const EyeOffIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
		<path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
		<path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
		<line x1="2" x2="22" y1="2" y2="22" />
	</svg>
);

const AlertIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<circle cx="12" cy="12" r="10" />
		<line x1="12" x2="12" y1="8" y2="12" />
		<line x1="12" x2="12.01" y1="16" y2="16" />
	</svg>
);

const UserIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
		<circle cx="12" cy="7" r="4" />
	</svg>
);

// 登入頁面插圖
const LoginIllustration = () => (
	<svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
		{/* 背景裝飾圓形 */}
		<circle cx="200" cy="150" r="120" fill="rgba(255,255,255,0.1)" />
		<circle cx="200" cy="150" r="80" fill="rgba(255,255,255,0.1)" />
		
		{/* 電腦螢幕 */}
		<rect x="120" y="80" width="160" height="100" rx="8" fill="#fff" />
		<rect x="130" y="90" width="140" height="70" rx="4" fill="#fef3c7" />
		
		{/* 螢幕內容 - 登入表單示意 */}
		<rect x="150" y="105" width="100" height="10" rx="2" fill="#d97706" />
		<rect x="150" y="125" width="100" height="10" rx="2" fill="#d97706" />
		<rect x="170" y="145" width="60" height="12" rx="4" fill="#f59e0b" />
		
		{/* 螢幕底座 */}
		<rect x="175" y="180" width="50" height="8" fill="#92400e" />
		<rect x="160" y="188" width="80" height="6" rx="2" fill="#78350f" />
		
		{/* 裝飾元素 - 辣椒 */}
		<circle cx="320" cy="100" r="25" fill="rgba(255,255,255,0.2)" />
		<ellipse cx="320" cy="100" rx="8" ry="15" fill="#dc2626" />
		<path d="M320 85 Q325 80 322 75" stroke="#059669" strokeWidth="3" fill="none" strokeLinecap="round" />
		
		{/* 裝飾元素 - 香料葉 */}
		<circle cx="80" cy="120" r="20" fill="rgba(255,255,255,0.2)" />
		<ellipse cx="80" cy="115" rx="12" ry="8" fill="#84cc16" />
		<ellipse cx="80" cy="125" rx="12" ry="8" fill="#84cc16" />
		<path d="M80 108 L80 132" stroke="#059669" strokeWidth="2" />
		
		{/* 人物 - 廚師帽 */}
		<circle cx="200" cy="230" r="20" fill="#fcd34d" />
		<circle cx="192" cy="226" r="2" fill="#78350f" />
		<circle cx="208" cy="226" r="2" fill="#78350f" />
		<path d="M195 235 Q200 240 205 235" stroke="#78350f" strokeWidth="2" fill="none" />
		<ellipse cx="200" cy="212" rx="18" ry="8" fill="#fff" />
		<rect x="185" y="204" width="30" height="10" rx="2" fill="#fff" />
		<rect x="180" y="250" width="40" height="30" rx="4" fill="#d97706" />
	</svg>
);

const Login = () => {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const { register, handleSubmit, reset, formState: { errors } } = useForm({
		defaultValues: {
			username: "",
			password: ""
		}
	});

	const onSubmit = async (data) => {
		console.log(data);
		setIsLoading(true);

		try {
			const response = await plainApi.post("/admin/signin", data);
			const { token, expired } = response.data;

			if (!token) {
				throw new Error("未收到有效的 token");
			}

			setToken(token, expired);
			toast.success("登入成功");
			navigate("/admin/dashboard", { replace: true });
		} catch (error) {
			const errMsg = error?.response?.data?.message || error?.message || "登入失敗，請檢查帳號密碼或網路連線";

			toast.error(`${errMsg}`, {
				autoClose: 3000,
				position: "top-center",
				theme: "colored",
			});
			reset();
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="login-page">
			<div className="login-container">
				{/* 左側插圖區域 - 桌面版顯示 */}
				<div className="login-illustration">
					<LoginIllustration />
					<h2>歡迎回來！</h2>
					<p>登入您的帳戶，開始管理您的業務</p>
				</div>

				{/* 右側表單區域 */}
				<div className="login-form-section">
					<div className="login-header">
						<div className="logo-icon">
							<UserIcon />
						</div>
						<h1>帳戶登入</h1>
						<p>請輸入您的登入資訊</p>
					</div>

					<form className="login-form" onSubmit={handleSubmit(onSubmit)}>
						<div className="form-group">
							<label htmlFor="username" className="form-label">
								電子郵件
							</label>
							<div className="input-wrapper">
								<span className="input-icon">
									<MailIcon />
								</span>
								<input
									{...register("username", { 
										required: "請輸入電子郵件",
										pattern: {
											value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
											message: "請輸入有效的電子郵件格式"
										}
									})}
									type="email"
									className={`form-control ${errors.username ? 'is-invalid' : ''}`}
									id="username"
									placeholder="example@email.com"
									autoComplete="email"
								/>
							</div>
							{errors.username && (
								<div className="error-message">
									<AlertIcon />
									<span>{errors.username.message}</span>
								</div>
							)}
						</div>

						<div className="form-group">
							<label htmlFor="password" className="form-label">
								密碼
							</label>
							<div className="input-wrapper">
								<span className="input-icon">
									<LockIcon />
								</span>
								<input
									{...register("password", { 
										required: "請輸入密碼",
										minLength: {
											value: 6,
											message: "密碼至少需要 6 個字元"
										}
									})}
									type={showPassword ? "text" : "password"}
									className={`form-control ${errors.password ? 'is-invalid' : ''}`}
									id="password"
									placeholder="請輸入您的密碼"
									autoComplete="current-password"
								/>
								<button
									type="button"
									className="password-toggle"
									onClick={() => setShowPassword(!showPassword)}
									aria-label={showPassword ? "隱藏密碼" : "顯示密碼"}
								>
									{showPassword ? <EyeOffIcon /> : <EyeIcon />}
								</button>
							</div>
							{errors.password && (
								<div className="error-message">
									<AlertIcon />
									<span>{errors.password.message}</span>
								</div>
							)}
						</div>

						<button type="submit" className="btn-login" disabled={isLoading}>
							{isLoading ? (
								<>
									<span className="spinner"></span>
									登入中...
								</>
							) : (
								"登入"
							)}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Login;
