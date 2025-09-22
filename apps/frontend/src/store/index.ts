import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "src/store/slices/authSlice";

// 负责配置 store
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

