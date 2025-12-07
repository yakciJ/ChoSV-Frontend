import axiosInstance from "./axiosInstance";

const url = `/api/UserWallPost/`;

export const getUserWallPosts = async (userId, pageIndex, pageSize) => {
    const response = await axiosInstance.get(
        url + `${userId}?pageIndex=${pageIndex}&pageSize=${pageSize}`
    );
    return response;
};
