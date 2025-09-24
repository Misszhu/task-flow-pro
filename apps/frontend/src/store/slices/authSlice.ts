import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { AuthState, User } from "src/types/auth";
import { AuthService } from "src/services/api";
import { LoginRequest, RegisterRequest, AuthResponse } from "src/types/api";

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// 异步Action: 登录
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(credentials);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.error || '登录失败');
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '登录失败');
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await AuthService.register(userData);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.error || '注册失败');
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '注册失败');
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {

    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '退出登录失败');
    }
  }
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.error = null;
      });
  }
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;
export const authReducer = authSlice.reducer;