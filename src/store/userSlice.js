import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as userService from "../services/userService";
import * as authService from "../services/authService";

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
    async (credentials, { rejectWithValue }) => {
        try {
            console.log("Attempting login with:", credentials); // Debug log
            const response = await authService.login(credentials);
            console.log("Login response received:", response); // Debug log

            // Check if response exists and has the expected structure
            if (!response) {
                console.error("No response received from login API");
                throw new Error("No response received from server");
            }

            if (!response.accessToken) {
                console.error("No accessToken in response:", response);
                throw new Error("Invalid response: missing access token");
            }

            if (!response.userName) {
                console.error("No userName in response:", response);
                throw new Error("Invalid response: missing username");
            }

            console.log("Login successful, storing tokens..."); // Debug log
            localStorage.setItem("access_token", response.accessToken);
            localStorage.setItem("userName", response.userName);
            localStorage.setItem("user_data", JSON.stringify(response)); // Store complete user data

            return response;
        } catch (error) {
            console.error("Login error:", error); // Debug log

            // Handle axios errors specifically
            if (error.response) {
                // Server responded with error status
                return rejectWithValue(
                    error.response.data?.error ||
                        `Lỗi máy chủ: ${error.response.status}`
                );
            } else if (error.request) {
                // Network error
                return rejectWithValue(
                    "Lỗi mạng: Không thể kết nối đến máy chủ"
                );
            } else {
                // Other errors
                return rejectWithValue(
                    error.message || "Đã xảy ra lỗi không xác định"
                );
            }
        }
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
            localStorage.removeItem("user_data");
        },
        clearError: (state) => {
            state.error = null;
        },
        initializeAuth: (state) => {
            const token = localStorage.getItem("access_token");
            const userData = localStorage.getItem("user_data");

            if (token && userData) {
                try {
                    const parsedUserData = JSON.parse(userData);
                    state.isAuthenticated = true;
                    state.info = parsedUserData; // Set complete user data
                } catch (error) {
                    console.error(
                        "Error parsing user data from localStorage:",
                        error
                    );
                    // Clear corrupted data
                    localStorage.removeItem("user_data");
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("userName");
                }
            }
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
                state.error = action.payload;
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
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            })

            // UPDATE
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                state.info = action.payload;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const { logout, clearError, initializeAuth } = userSlice.actions;
export default userSlice.reducer;
