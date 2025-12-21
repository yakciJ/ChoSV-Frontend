import axiosInstance from "./axiosInstance";

const url = "/api/Category/";

export const getAllCategories = async () => {
    const response = await axiosInstance.get(url + "tree");
    return response;
};

export const getProductsByCategoryId = async (
    categoryId,
    page = 1,
    pageSize = 24
) => {
    const response = await axiosInstance.get(url + `${categoryId}/products`, {
        params: {
            page,
            pageSize,
        },
    });
    return response;
};
