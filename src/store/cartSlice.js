import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/services";

// ===== Async Thunks =====

// 取得購物車
export const fetchCart = createAsyncThunk("cart/fetchCart", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get("/cart");
		return response.data.data; // { carts, total, final_total }
	} catch (error) {
		return rejectWithValue(error.response?.data?.message || "取得購物車失敗");
	}
});

// 更新購物車項目數量
export const updateCartItem = createAsyncThunk(
	"cart/updateCartItem",
	async ({ cartId, productId, qty }, { rejectWithValue }) => {
		try {
			const response = await api.put(`/cart/${cartId}`, {
				data: { product_id: productId, qty },
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || "更新數量失敗");
		}
	}
);

// 刪除單一購物車項目
export const removeCartItem = createAsyncThunk("cart/removeCartItem", async (cartId, { rejectWithValue }) => {
	try {
		const response = await api.delete(`/cart/${cartId}`);
		return { cartId, message: response.data.message };
	} catch (error) {
		return rejectWithValue(error.response?.data?.message || "刪除失敗");
	}
});

// 清空購物車
export const clearCart = createAsyncThunk("cart/clearCart", async (_, { rejectWithValue }) => {
	try {
		const response = await api.delete("/carts");
		return response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data?.message || "清空購物車失敗");
	}
});

// ===== Slice =====

const cartSlice = createSlice({
	name: "cart",
	initialState: {
		carts: [],
		total: 0,
		finalTotal: 0,
		isLoading: false, // 取得購物車時的 loading
		isClearingAll: false, // 清空購物車時的 loading
		updatingIds: [], // 正在更新或刪除中的 cartId 陣列，用來顯示個別項目的 loading
	},
	reducers: {
		// optimisticUpdate: For updating cart item quantity in the UI before server response
		optimisticUpdateQty(state, action) {
			console.log("optimisticUpdateQty", state.carts);
			const { cartId, qty } = action.payload;
			const item = state.carts.find((i) => i.id === cartId);
			if (item) item.qty = qty;
		},
	},
	extraReducers: (builder) => {
		builder
			// ── fetchCart ──
			.addCase(fetchCart.pending, (state) => {
				console.log("fetchCart pending", state.carts);
				state.isLoading = true;
			})
			.addCase(fetchCart.fulfilled, (state, action) => {
				console.log("fetchCart fulfilled", state);
				console.log("fetchCart fulfilled", action);
				state.isLoading = false;
				state.carts = action.payload.carts;
				state.total = action.payload.total;
				state.finalTotal = action.payload.final_total;
			})
			.addCase(fetchCart.rejected, (state) => {
				console.log("fetchCart rejected", state.carts);
				state.isLoading = false;
			})

			// ── updateCartItem ──
			.addCase(updateCartItem.pending, (state, action) => {
				state.updatingIds.push(action.meta.arg.cartId);
			})
			.addCase(updateCartItem.fulfilled, (state, action) => {
				const { cartId } = action.meta.arg;
				state.updatingIds = state.updatingIds.filter((id) => id !== cartId);
			})
			.addCase(updateCartItem.rejected, (state, action) => {
				const { cartId } = action.meta.arg;
				state.updatingIds = state.updatingIds.filter((id) => id !== cartId);
			})

			// ── removeCartItem ──
			.addCase(removeCartItem.pending, (state, action) => {
				console.log("removeCartItem pending", action);
				state.updatingIds.push(action.meta.arg);
			})
			.addCase(removeCartItem.fulfilled, (state, action) => {
				const { cartId } = action.payload;
				state.carts = state.carts.filter((i) => i.id !== cartId);
				state.updatingIds = state.updatingIds.filter((id) => id !== cartId);
			})
			.addCase(removeCartItem.rejected, (state, action) => {
				state.updatingIds = state.updatingIds.filter((id) => id !== action.meta.arg);
			})

			// ── clearCart ──
			.addCase(clearCart.pending, (state) => {
				state.isClearingAll = true;
			})
			.addCase(clearCart.fulfilled, (state) => {
				state.isClearingAll = false;
				state.carts = [];
				state.total = 0;
				state.finalTotal = 0;
			})
			.addCase(clearCart.rejected, (state) => {
				state.isClearingAll = false;
			});
	},
});

export const { optimisticUpdateQty } = cartSlice.actions;
export default cartSlice.reducer;
