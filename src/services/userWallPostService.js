import axiosInstance from "./axiosInstance";

const url = `/api/UserWallPost/`;

export const getUserWallPosts = async (userName, page, pageSize) => {
    const response = await axiosInstance.get(
        url + `${userName}?page=${page}&pageSize=${pageSize}`
    );
    return response;
};

export const createUserWallPost = async (postData) => {
    const response = await axiosInstance.post(url, postData);
    return response;
};
// {
//   "userWallOwnerId": "string",
//   "commentContent": "string"
// }
export const updateUserWallPost = async (postData) => {
    const response = await axiosInstance.put(url, postData);
    return response;
};
// {
//   "userWallPostId": 0,
//   "commentContent": "string"
// }
export const deleteUserWallPost = async (postId) => {
    const response = await axiosInstance.delete(url + `${postId}`);
    return response;
};

// Admin functions
export const getAllUserWallPosts = async (page = 1, pageSize = 10) => {
    const response = await axiosInstance.get(url, {
        params: {
            page,
            pageSize,
        },
    });
    return response;
};

export const deleteUserWallPostAdmin = async (postId) => {
    const response = await axiosInstance.delete(url + `admin/${postId}`);
    return response;
};
