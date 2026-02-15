import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/services";

// ===== Async Thunks =====

// 建立訂單
export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post("/order", {
        data: orderData,
      });
      return response.data; // { success, message, total, create_at, orderId }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "建立訂單失敗");
    }
  },
);

// 取得訂單列表
export const fetchOrders = createAsyncThunk(
  "order/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/orders");
      return response.data; // { success, orders, pagination, messages }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "取得訂單失敗");
    }
  },
);

// 取得單一訂單
export const fetchOrder = createAsyncThunk(
  "order/fetchOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/order/${orderId}`);
      return response.data; // { success, order }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "取得訂單詳情失敗",
      );
    }
  },
);

// 付款
export const payOrder = createAsyncThunk(
  "order/payOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/pay/${orderId}`);
      return response.data; // { success, message }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "付款失敗");
    }
  },
);

// ===== Slice =====

const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: [],
    currentOrder: null,
    lastOrderId: null,
    pagination: null,
    isCreating: false,
    isPaying: false,
    isLoading: false,
  },
  reducers: {
    clearCurrentOrder(state) {
      state.currentOrder = null;
    },
    clearLastOrderId(state) {
      state.lastOrderId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── createOrder ──
      .addCase(createOrder.pending, (state) => {
        state.isCreating = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isCreating = false;
        state.lastOrderId = action.payload.orderId;
      })
      .addCase(createOrder.rejected, (state) => {
        state.isCreating = false;
      })

      // ── fetchOrders ──
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchOrders.rejected, (state) => {
        state.isLoading = false;
      })

      // ── fetchOrder ──
      .addCase(fetchOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload.order;
      })
      .addCase(fetchOrder.rejected, (state) => {
        state.isLoading = false;
      })

      // ── payOrder ──
      .addCase(payOrder.pending, (state) => {
        state.isPaying = true;
      })
      .addCase(payOrder.fulfilled, (state) => {
        state.isPaying = false;
        if (state.currentOrder) {
          state.currentOrder.is_paid = true;
        }
      })
      .addCase(payOrder.rejected, (state) => {
        state.isPaying = false;
      });
  },
});

export const { clearCurrentOrder, clearLastOrderId } = orderSlice.actions;
export default orderSlice.reducer;
