import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  role: 'guest' | 'customer' | 'admin';
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  role: 'guest',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.role = action.payload.role;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.role = 'guest';
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
