import axiosInstance from "./axiosInstance";
import axios from "axios";

const url = "/api/User/";

export const login = async (credentials) => {
    const response = await axiosInstance.post(`${url}login`, credentials);
    return response;
};
export const register = async (userInfo) => {
    const response = await axiosInstance.post(`${url}register`, userInfo);
    return response;
};
export const logout = async () => {
    const response = await axiosInstance.post(`${url}logout`);
    return response;
};

const axiosNoAuth = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});

export const refreshToken = async () => {
    const { data } = await axiosNoAuth.get("/api/User/refreshToken");
    return data;
};

export const forgotPassword = async (email) => {
    const response = await axiosInstance.post(
        `${url}forgotPassword?email=${encodeURIComponent(email)}`,
    );
    console.log("Forgot Password Response:", response);
    return response;
};

export const resetPassword = async (
    email,
    token,
    newPassword,
    confirmPassword,
) => {
    const response = await axiosInstance.put(`${url}resetPassword`, {
        email,
        token,
        newPassword,
        confirmPassword,
    });
    return response;
};

export const confirmEmail = async (email, token) => {
    const response = await axiosInstance.post(
        `${url}confirmEmail?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`,
    );
    return response;
};
