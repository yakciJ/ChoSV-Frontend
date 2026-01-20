import axiosInstance from "./axiosInstance";

const url = "/api/Report";

export const sendReport = async (reportData) => {
	console.log("Sending report data:", reportData);
    const response = await axiosInstance.post(url, reportData);
    return response.data;
};

export const REPORT_TYPES = {
    USER: "User",
    PRODUCT: "Product",
    COMMENT: "Comment",
};
