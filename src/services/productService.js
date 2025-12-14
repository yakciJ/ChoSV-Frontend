import axiosInstance from "./axiosInstance";

const url = `/api/Product/`;

export const getNewestProducts = async (page = 1, pageSize = 12) => {
    const response = await axiosInstance.get(url + `newest`, {
        params: {
            page,
            pageSize,
        },
    });
    return response;
};

export const getPopularProducts = async (
    page = 1,
    pageSize = 12,
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
