import { combineReducers } from "@reduxjs/toolkit";
import { authReducer } from "src/store/slices/authSlice";

// 组合所有 reducer
export const rootReducer = combineReducers({
  auth: authReducer,
});
