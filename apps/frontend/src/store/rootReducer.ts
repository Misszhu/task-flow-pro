import { combineReducers } from "@reduxjs/toolkit";
import { authReducer } from "src/store/slices/authSlice";

// 组合所有 reducer
const rootReducer = combineReducers({
  auth: authReducer,
  // 后续添加其他 reducers
});

export default rootReducer;

// 导出根状态类型
export type RootState = ReturnType<typeof rootReducer>