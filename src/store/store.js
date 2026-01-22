import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import categoryReducer from "./categorySlice";
import notificationReducer from "./notificationSlice";

const appReducer = combineReducers({
    user: userReducer,
    categories: categoryReducer,
    notifications: notificationReducer,
    // Add more reducers here as your app grows
});

const rootReducer = (state, action) => {
    if (action.type === "RESET_STORE") {
        state = undefined; // This resets all state to initial values
        console.log("Store has been reset");
    }
    return appReducer(state, action);
};

export const store = configureStore({
    reducer: rootReducer, // Use rootReducer instead of just userReducer
});
