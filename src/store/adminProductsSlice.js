import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/services";

// ===== Async Thunks =====

// 取得管理員產品列表（含分頁）
export const fetchAdminProducts = createAsyncThunk(
	"adminProducts/fetchAdminProducts",
	async (page = 1, { rejectWithValue }) => {
		try {
			const response = await api.get(`/admin/products?page=${page}`);
			return {
				products: response.data.products || [],
				pagination: response.data.pagination,
				page,
			};
		} catch (error) {
			return rejectWithValue(error?.response?.data?.message || "取得管理員產品列表失敗");
		}
	}
);

// 新增或更新產品
export const saveProduct = createAsyncThunk("adminProducts/saveProduct", async (productData, { rejectWithValue }) => {
	try {
		const payload = {
			data: {
				...productData,
				origin_price: Number(productData.origin_price),
				price: Number(productData.price),
				num: Math.floor(Number(productData.num)) || 1,
				is_enabled: productData.is_enabled ? 1 : 0,
				imagesUrl: (productData.imagesUrl || []).filter((url) => url && url.trim() !== ""),
				label: (productData.label || []).filter((tag) => tag && tag.trim() !== ""),
			},
		};
		let response;
		if (productData.id) {
			response = await api.put(`/admin/product/${productData.id}`, payload);
		} else {
			response = await api.post(`/admin/product`, payload);
		}
		return response.data;
	} catch (error) {
		return rejectWithValue(error?.response?.data?.message || "操作失敗");
	}
});

// 刪除產品
export const deleteAdminProduct = createAsyncThunk(
	"adminProducts/deleteProduct",
	async (id, { rejectWithValue }) => {
		try {
			const response = await api.delete(`/admin/product/${id}`);
			return { id, message: response.data.message };
		} catch (error) {
			return rejectWithValue(error?.response?.data?.message || "刪除產品失敗");
		}
	}
);

// ===== Slice =====

const adminProductsSlice = createSlice({
	name: "adminProducts",
	initialState: {
		products: [],
		pagination: {
			category: "",
			current_page: 1,
			has_pre: false,
			has_next: false,
			total_pages: 1,
		},
		currentPage: 1,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder
			// ── fetchAdminProducts ──
			.addCase(fetchAdminProducts.fulfilled, (state, action) => {
				state.products = action.payload.products;
				state.pagination = action.payload.pagination || {
					total_pages: 1,
					current_page: 1,
					has_pre: false,
					has_next: false,
					category: "",
				};
				state.currentPage = action.payload.page;
			})
			.addCase(fetchAdminProducts.rejected, (state) => {
				state.products = [];
			});
	},
});

export default adminProductsSlice.reducer;
