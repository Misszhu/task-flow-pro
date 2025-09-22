import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "src/store/rootReducer";

// 负责配置 store
export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== "production",
});

// 导出类型
export type AppDispatch = typeof store.dispatch;

// 导出 store
export default store;