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

export const getSimilarProducts = async (
    productId,
    page = 1,
    pageSize = 12
) => {
    const response = await axiosInstance.get(url + `${productId}/similar`, {
        params: {
            page,
            pageSize,
        },
    });
    return response;
};

export const getMyProduct = async (page = 1, pageSize = 10, status = null) => {
    const response = await axiosInstance.get(url + `me`, {
        params: {
            page,
            pageSize,
            status,
        },
    });
    return response;
};

export const getUserProducts = async (userName, page = 1, pageSize = 10) => {
    const response = await axiosInstance.get(url + `user/${userName}`, {
        params: {
            page,
            pageSize,
        },
    });
    return response;
};

export const createProduct = async (productData) => {
    const response = await axiosInstance.post(url, productData);
    return response;
};
export const updateProduct = async (productId, productData) => {
    const response = await axiosInstance.put(url + `${productId}`, productData);
    return response;
};

export const deleteUserProduct = async (productId) => {
    const response = await axiosInstance.delete(url + `user/${productId}`);
    return response;
};

export const updateProductStatus = async (productId, status) => {
    const response = await axiosInstance.put(
        url + `${productId}/status`,
        JSON.stringify(status),
        {
            headers: {
                "Content-Type": "application/json-patch+json",
            },
        }
    );
    return response;
};

export const getProductDetailsAdmin = async (productId) => {
    const response = await axiosInstance.get(url + `admin/${productId}`);
    return response;
};

export const getAllProductsAdmin = async (
    page = 1,
    pageSize = 20,
    status = null
) => {
    const response = await axiosInstance.get(url + `admin/all`, {
        params: {
            page,
            pageSize,
            status,
        },
    });
    return response;
};

export const changeProductStatus = async (productId, newStatus) => {
    const response = await axiosInstance.put(
        url + `${productId}/status`,
        `"${newStatus}"`,
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
    return response;
};

export const deleteProductAdmin = async (productId) => {
    const response = await axiosInstance.delete(url + `admin/${productId}`);
    return response;
};

export const searchProducts = async (
    search = "",
    categoryId = null,
    minPrice = null,
    maxPrice = null,
    page = 1,
    pageSize = 24,
    sortBy = "relevance"
) => {
    const params = {
        page,
        pageSize,
        sortBy,
    };

    if (search) params.search = search;
    if (categoryId) params.categoryId = categoryId;
    if (minPrice !== null && minPrice !== "") params.minPrice = minPrice;
    if (maxPrice !== null && maxPrice !== "") params.maxPrice = maxPrice;

    const response = await axiosInstance.get(url + "search", { params });
    return response;
};
