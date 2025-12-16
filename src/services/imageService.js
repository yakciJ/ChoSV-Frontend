import axiosInstance from "./axiosInstance";

const url = "/api/Image/";

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("File", file);

    const response = await axiosInstance.post(url + "upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response;
};

export const uploadMultipleImages = async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append("files", file);
    });

    const response = await axiosInstance.post(
        url + "upload-multiple",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
    return response;
};

export const deleteImage = async (imageUrl) => {
    const response = await axiosInstance.delete(url, {
        params: { imageUrl },
    });
    return response;
};
