import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice";
import orderReducer from "./orderSlice";
import productsReducer from "./productsSlice";
import productDetailReducer from "./productDetailSlice";
import adminProductsReducer from "./adminProductsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    order: orderReducer,
    products: productsReducer,
    productDetail: productDetailReducer,
    adminProducts: adminProductsReducer,
  },
});
