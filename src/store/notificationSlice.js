import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    unreadCount: 0,
    isLoading: false,
    error: null,
};

const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        setUnreadCount: (state, action) => {
            state.unreadCount = action.payload;
        },
        incrementUnreadCount: (state) => {
            state.unreadCount += 1;
        },
        decrementUnreadCount: (state) => {
            if (state.unreadCount > 0) {
                state.unreadCount -= 1;
            }
        },
        resetUnreadCount: (state) => {
            state.unreadCount = 0;
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const {
    setUnreadCount,
    incrementUnreadCount,
    decrementUnreadCount,
    resetUnreadCount,
    setLoading,
    setError,
    clearError,
} = notificationSlice.actions;

export default notificationSlice.reducer;
