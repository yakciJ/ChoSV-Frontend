import axiosInstance from "./axiosInstance";

const url = "/api/Category/";

export const getAllCategories = async () => {
    const response = await axiosInstance.get(url + "tree");
    return response;
};
