import axiosInstance from "./axiosInstance";

const url = `/api/Product/`;

export const getProduct = async (productId) => {
    const response = await axiosInstance.get(url + `${productId}`, {
        skipAuthRedirect: true,
    });
    return response;
};

