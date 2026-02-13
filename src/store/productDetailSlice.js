import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/services";

// ===== Async Thunks =====

// 取得單一產品詳情（Product 頁面用）
export const fetchProduct = createAsyncThunk("productDetail/fetchProduct", async (id, { rejectWithValue }) => {
	try {
		const response = await api.get(`/product/${id}`);
		return response.data.product;
	} catch (error) {
		return rejectWithValue(error?.response?.data?.message || "取得產品失敗");
	}
});

// ===== Slice =====

const productDetailSlice = createSlice({
	name: "productDetail",
	initialState: {
		selectedProduct: null, // 單一產品詳情
	},
	reducers: {
		// 離開詳情頁時清空資料
		clearSelectedProduct(state) {
			state.selectedProduct = null;
		},
	},
	extraReducers: (builder) => {
		builder
			// ── fetchProduct（單一產品）──
			.addCase(fetchProduct.fulfilled, (state, action) => {
				state.selectedProduct = action.payload;
			})
			.addCase(fetchProduct.rejected, (state) => {
				state.selectedProduct = null;
			});
	},
});

export const { clearSelectedProduct } = productDetailSlice.actions;
export default productDetailSlice.reducer;
