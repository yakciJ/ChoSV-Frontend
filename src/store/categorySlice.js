import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllCategories } from "../services/categoryService";

export const fetchAllCategories = createAsyncThunk(
    "categories/fetchAll",
    async (_, { rejectedWithValue }) => {
        try {
            const response = await getAllCategories();
            return response;
        } catch (error) {
            return rejectedWithValue(error.message);
        }
    }
);

const categorySlice = createSlice({
    name: "categories",
    initialState: {
        data: [],
        laoding: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCategories: (state) => {
            state.data = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchAllCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, clearCategories } = categorySlice.actions;
export default categorySlice.reducer;
