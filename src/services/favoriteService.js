import axiosInstance from "./axiosInstance";

const url = "/api/Favorite/";

export const addFavorite = async (productId) => {
    const response = await axiosInstance.post(`${url}?productId=${productId}`);
    return response;
};

export const removeFavorite = async (productId) => {
    const response = await axiosInstance.delete(`${url}${productId}`);
    return response;
};

export const getFavorites = async (page = 1, pageSize = 10) => {
    const response = await axiosInstance.get(
        `${url}?page=${page}&pageSize=${pageSize}`
    );
    return response;
};
