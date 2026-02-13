import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { plainApi, setToken, clearToken } from "@/services";

// ===== Async Thunks =====

// 檢查登入狀態（AuthRoute、ProtectedRoute 共用）
export const checkAuth = createAsyncThunk("auth/checkAuth", async (_, { rejectWithValue }) => {
	try {
		await plainApi.post("/api/user/check");
		return true;
	} catch {
		return rejectWithValue(false);
	}
});

// 登入
export const login = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
	try {
		const response = await plainApi.post("/admin/signin", credentials);
		const { token, expired } = response.data;
		if (!token) {
			throw new Error("未收到有效的 token");
		}
		setToken(token, expired);
		return response.data;
	} catch (error) {
		return rejectWithValue(error?.response?.data?.message || error?.message || "登入失敗，請檢查帳號密碼或網路連線");
	}
});

// 登出
export const logout = createAsyncThunk("auth/logout", async () => {
	try {
		await plainApi.post("/logout");
	} catch (error) {
		// 即使 API 失敗，仍清除本地登入狀態
		if (!(error.response?.status === 400 && error.response?.data?.message === "請重新登出")) {
			clearToken();
			throw error;
		}
	}
	clearToken();
	return true;
});

// ===== Slice =====

const authSlice = createSlice({
	name: "auth",
	initialState: {
		isAuthenticated: null, // null = 未檢查, true = 已登入, false = 未登入
		isLoggingIn: false, // 登入中的 loading 狀態
	},
	reducers: {
		// 重設認證狀態（路由切換時需要重新檢查）
		resetAuth(state) {
			state.isAuthenticated = null;
		},
	},
	extraReducers: (builder) => {
		builder
			// ── checkAuth ──
			.addCase(checkAuth.fulfilled, (state) => {
				state.isAuthenticated = true;
			})
			.addCase(checkAuth.rejected, (state) => {
				state.isAuthenticated = false;
			})
			// ── login ──
			.addCase(login.pending, (state) => {
				state.isLoggingIn = true;
			})
			.addCase(login.fulfilled, (state) => {
				state.isLoggingIn = false;
				state.isAuthenticated = true;
			})
			.addCase(login.rejected, (state) => {
				state.isLoggingIn = false;
			})
			// ── logout ──
			.addCase(logout.fulfilled, (state) => {
				state.isAuthenticated = false;
			})
			.addCase(logout.rejected, (state) => {
				state.isAuthenticated = false;
			});
	},
});

export const { resetAuth } = authSlice.actions;
export default authSlice.reducer;
