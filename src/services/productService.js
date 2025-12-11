import axiosInstance from "./axiosInstance";

const url = `/api/Product/`;

export const getNewestProducts = async () => {
    const response = await axiosInstance.get(url + `newest`);
    return response;
};

export const getPopularProducts = async (
    page = 1,
    pageSize = 10,
    daysBack = 30
) => {
    const response = await axiosInstance.get(url + `popular`, {
        params: {
            page,
            pageSize,
            daysBack,
        },
    });
    return response;
};

export const getRecommendedProducts = async () => {
    const response = await axiosInstance.get("/products/recommended", {
        skipAuthRedirect: true,
    });
    return response;
};

export const getProduct = async (productId) => {
    const response = await axiosInstance.get(url + `${productId}`);
    return response;
};
