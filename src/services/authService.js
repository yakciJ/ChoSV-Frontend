import axiosInstance from "./axiosInstance";
import axios from "axios";

const url = "/api/User/";

export const login = async (credentials) => {
    const response = await axiosInstance.post(`${url}login`, credentials);
    console.log("authService login response:", response);
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
