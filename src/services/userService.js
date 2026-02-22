import axiosInstance from "./axiosInstance";

const url = `/api/User/`;

export const getCurrentUser = async () => {
    const response = await axiosInstance.get(url + `me`, {
        skipAuthRedirect: true,
    });
    return response;
};

export const getUser = async (userName) => {
    const response = await axiosInstance.get(url + `${userName}`, {
        skipAuthRedirect: true,
    });
    return response;
};

export const updateUser = async (userData) => {
    const response = await axiosInstance.put(url + `profile`, userData);
    return response;
};

export const updateUserAvatar = async (imageUrl) => {
    const response = await axiosInstance.put(
        url + `avatar?imageUrl=${encodeURIComponent(imageUrl)}`,
    );
    return response;
};

export const getAllUsers = async (page = 1, pageSize = 10) => {
    const response = await axiosInstance.get(url + `admin/users`, {
        params: { page, pageSize },
    });
    return response;
};

export const banUser = async (userId) => {
    const response = await axiosInstance.put(url + `admin/ban/${userId}`);
    return response;
};

export const deleteUser = async (userId) => {
    const response = await axiosInstance.delete(url + `admin/${userId}`);
    return response;
};
