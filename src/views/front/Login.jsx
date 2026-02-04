import { plainApi, setToken } from "@/services";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

const Login = () => {
	const navigate = useNavigate();
	const [loginData, setLoginData] = useState({ username: "", password: "" });
	const [isLoading, setIsLoading] = useState(false);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setLoginData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const response = await plainApi.post("/admin/signin", loginData);
			const { token, expired } = response.data;

			if (!token) {
				throw new Error("未收到有效的 token");
			}

			// 使用統一的 token 設定函數
			setToken(token, expired);

			toast.success("登入成功");

			navigate("/admin/dashboard", { replace: true });
		} catch (error) {
			const errMsg = error?.response?.data?.message || error?.message || "登入失敗，請檢查帳號密碼或網路連線";

			toast.error(`登入失敗: ${errMsg}`, {
				autoClose: 5000,
				position: "top-center",
				theme: "colored",
			});
		} finally {
			setIsLoading(false);
		}
	};
  
	return (
		<>
			<h1 style={{ color: "red" }}>這應該是登入頁面 - Debug Marker</h1>
			<div className="row">
				<div className="col">
					<h2 className="fs-4 fw-bold text-primary mb-4 text-center">登入</h2>
					<div className="p-5 border-2 border rounded-4 w-100 mx-auto" style={{ maxWidth: "48rem" }}>
						<div className="p-4">
							<form onSubmit={handleSubmit}>
								<div className="mb-3">
									<label htmlFor="username" className="form-label">
										登入電郵
									</label>
									<input
										type="email"
										className="form-control"
										id="username"
										name="username"
										placeholder="請輸入用戶名"
										value={loginData.username}
										onChange={handleInputChange}
										required
									/>
								</div>
								<div className="mb-3">
									<label htmlFor="password" className="form-label">
										密碼
									</label>
									<input
										type="password"
										className="form-control"
										id="password"
										name="password"
										placeholder="請輸入密碼"
										value={loginData.password}
										onChange={handleInputChange}
										required
									/>
								</div>
								<button type="submit" className="btn btn-primary w-100 py-2 mt-3" disabled={isLoading}>
									{isLoading ? "登入中..." : "登入"}
								</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Login;
