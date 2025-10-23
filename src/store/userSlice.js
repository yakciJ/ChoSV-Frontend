import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as userService from "../services/userService";

// Lấy thông tin user
export const fetchCurrentUser = createAsyncThunk(
    "user/fetchUser",
    async (_, { rejectWithValue }) => {
        try {
            const userName = localStorage.getItem("userName");
            if (!userName) throw new Error("No user logged in");
            return await userService.getUser(userName);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const loginUser = createAsyncThunk(
    "user/loginUser",
    async (credentials) => {
        const response = await userService.login(credentials);
        localStorage.setItem("access_token", response.accessToken);
        localStorage.setItem("userName", response.userName);
        return response;
    }
);

// Cập nhật thông tin user
export const updateUser = createAsyncThunk("user/updateUser", async (data) => {
    return await userService.updateUser(data);
});

const userSlice = createSlice({
    name: "user",
    initialState: {
        info: null,
        isAuthenticated: false,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.info = null;
            state.isAuthenticated = false;
            localStorage.removeItem("access_token");
            localStorage.removeItem("userName");
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.info = action.payload;
                state.isAuthenticated = !!action.payload;
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.loading = false;
                state.info = null;
                state.isAuthenticated = false;
                state.error = action.error.message;
            })

            // LOGIN
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.info = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // UPDATE
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                state.info = action.payload; // Cập nhật lại user
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
