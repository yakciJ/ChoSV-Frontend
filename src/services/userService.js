import axiosInstance from "axiosInstance";

const url = `/api/User/`;

export const getUser = async (userName) => {
    const response = await axiosInstance.get(url + `${userName}`, {
        skipAuthRedirect: true,
    });
    return response.data;
};

export const updateUser = async (userData) => {
    const response = await axiosInstance.put(url + `profile`, userData);
    return response.data;
};
