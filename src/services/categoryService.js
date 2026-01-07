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

// Admin category management functions
export const createCategory = async (categoryData) => {
    const response = await axiosInstance.post(url, categoryData);
    return response;
};

export const updateCategory = async (categoryData) => {
    const response = await axiosInstance.put(url, categoryData);
    return response;
};

export const deleteCategory = async (categoryId) => {
    const response = await axiosInstance.delete(url + categoryId);
    return response;
};
