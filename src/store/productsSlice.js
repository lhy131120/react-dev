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

// 取得單一產品詳情（Product 頁面用）
export const fetchProduct = createAsyncThunk("products/fetchProduct", async (id, { rejectWithValue }) => {
	try {
		const response = await api.get(`/product/${id}`);
		return response.data.product;
	} catch (error) {
		return rejectWithValue(error?.response?.data?.message || "取得產品失敗");
	}
});

// ===== Slice =====

const productsSlice = createSlice({
	name: "products",
	initialState: {
		products: [], // 全部產品列表
		selectedCategory: "all", // 分類篩選
		selectedProduct: null, // 單一產品詳情
		isLoading: false, // 載入狀態
		isDetailLoading: false,
	},
	reducers: {
		// 設定分類篩選
		setCategory(state, action) {
			state.selectedCategory = action.payload;
		},
		// 離開詳情頁時清空資料
		clearSelectedProduct(state) {
			state.selectedProduct = null;
		},
	},
	extraReducers: (builder) => {
		builder
			// ── fetchProducts（全部產品）──
			.addCase(fetchProducts.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(fetchProducts.fulfilled, (state, action) => {
				state.isLoading = false;
				// 後端回傳的是 { id1: {...}, id2: {...} } 物件，轉成陣列
				state.products = Object.keys(action.payload).map((id) => ({
					id,
					...action.payload[id],
				}));
			})
			.addCase(fetchProducts.rejected, (state) => {
				state.isLoading = false;
			})

			// ── fetchProduct（單一產品）──
			.addCase(fetchProduct.pending, (state) => {
				state.isDetailLoading = true;
			})
			.addCase(fetchProduct.fulfilled, (state, action) => {
				state.isDetailLoading = false;
				state.selectedProduct = action.payload;
			})
			.addCase(fetchProduct.rejected, (state) => {
				state.isDetailLoading = false;
				state.selectedProduct = null;
			});
	},
});

export const { setCategory, clearSelectedProduct } = productsSlice.actions;
export default productsSlice.reducer;