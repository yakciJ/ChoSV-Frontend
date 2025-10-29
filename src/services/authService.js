import axiosInstance from "./axiosInstance";

const url = "/api/User/";

export const login = async (credentials) => {
    const response = await axiosInstance.post(`${url}login`, credentials);
    console.log("authService login response:", response); // Debug log
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
export const refreshToken = async () => {
    const response = await axiosInstance.post(`${url}refresh-token`);
    return response;
};
