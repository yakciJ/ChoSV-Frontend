import axiosInstance from "./axiosInstance";

const url = "/api/University/";

export const getAllUniversities = async (page = 1, pageSize = 10) => {
    const response = await axiosInstance.get(url, {
        params: {
            page,
            pageSize,
        },
    });
    return response;
};

export const createUniversity = async (universityData) => {
    const response = await axiosInstance.post(url, universityData);
    return response;
};

export const updateUniversity = async (universityId, universityData) => {
    const response = await axiosInstance.put(
        url + universityId,
        universityData,
    );
    return response;
};

export const deleteUniversity = async (universityId) => {
    const response = await axiosInstance.delete(url + universityId);
    return response;
};
