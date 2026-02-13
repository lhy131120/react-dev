import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/services";

// ===== Async Thunks =====

// 取得所有產品（Home、Products 頁面共用）
export const fetchProducts = createAsyncThunk("products/fetchProducts", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get("/products/all");
		return response.data.products; // 後端回傳 { products: { id1: {...}, id2: {...} } }
	} catch (error) {
		return rejectWithValue(error?.response?.data?.message || "取得產品列表失敗");
	}
});

// ===== Slice =====

const productsSlice = createSlice({
	name: "products",
	initialState: {
		products: [], // 全部產品列表
		selectedCategory: "all", // 分類篩選
	},
	reducers: {
		// 設定分類篩選
		setCategory(state, action) {
			state.selectedCategory = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			// ── fetchProducts（全部產品）──
			.addCase(fetchProducts.fulfilled, (state, action) => {
				// 後端回傳的是 { id1: {...}, id2: {...} } 物件，轉成陣列
				state.products = Object.keys(action.payload).map((id) => ({
					id,
					...action.payload[id],
				}));
			});
	},
});

export const { setCategory } = productsSlice.actions;
export default productsSlice.reducer;